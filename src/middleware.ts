import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'
import { JWT_SECRET } from '@/lib/config'
import { prisma } from '@/lib/prisma'

// Create TextEncoder for jose
const encoder = new TextEncoder()

// Helper function to check if path should be excluded
function isExcludedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/api/studio/check-email') ||
    pathname.startsWith('/api/studio/register') ||
    pathname.startsWith('/api/studio/login') ||
    pathname.startsWith('/studio/api/login') ||
    pathname.startsWith('/studio/auth') ||
    pathname.startsWith('/studio/subscription/upgrade') || // Allow access to upgrade page
    pathname.startsWith('/api/studio/upload/logo') || // Allow logo upload during registration
    pathname.startsWith('/api/studio/upload/photo') // Allow photo upload during registration
  )
}

async function checkTrialStatus(studioId: string): Promise<boolean> {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      select: { 
        subscriptionTier: true,
        trialEndsAt: true
      }
    });

    if (!studio) return false;

    // Only check trial expiration for free tier
    if (studio.subscriptionTier === 'Free' && studio.trialEndsAt) {
      return new Date() < new Date(studio.trialEndsAt);
    }

    return true;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log('Middleware checking path:', pathname)

  // Skip middleware for excluded paths
  if (isExcludedPath(pathname)) {
    console.log('Skipping middleware for excluded path:', pathname)
    return NextResponse.next()
  }

  // Handle studio routes (including API routes)
  if (pathname.startsWith('/studio') || pathname.startsWith('/api/studio')) {
    // Check Authorization header first
    const authHeader = request.headers.get('Authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    // If no token in header, try to get from cookie
    if (!token) {
      token = request.cookies.get('studio_token')?.value
    }

    if (!token) {
      console.log('No token found in headers or cookies')
      // Only redirect to login for non-API routes
      if (!pathname.startsWith('/api')) {
        const response = NextResponse.redirect(new URL('/studio/auth/login', request.url))
        // Add cache control headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const secret = encoder.encode(JWT_SECRET)
      const decoded = await jose.jwtVerify(token, secret)
      console.log('Token verified successfully')

      // Check trial status
      const studioId = decoded.payload.studioId as string
      const isTrialValid = await checkTrialStatus(studioId)

      if (!isTrialValid) {
        // Redirect to upgrade page if trial has expired
        if (!pathname.startsWith('/api')) {
          const response = NextResponse.redirect(new URL('/studio/subscription/upgrade', request.url))
          response.headers.set('Cache-Control', 'no-store, max-age=0')
          response.headers.set('Pragma', 'no-cache')
          response.headers.set('Expires', '0')
          return response
        }
        return NextResponse.json({ error: 'Trial period has expired' }, { status: 403 })
      }
      
      // Clone the request headers and add the verified token
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('Authorization', `Bearer ${token}`)
      
      // Return response with modified headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      // Ensure the cookie is set/refreshed
      response.cookies.set('studio_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response
    } catch (error) {
      console.error('Token verification failed:', error)
      // Only redirect to login for non-API routes
      if (!pathname.startsWith('/api')) {
        const response = NextResponse.redirect(new URL('/studio/auth/login', request.url))
        // Add cache control headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Handle master admin routes
  if (pathname.startsWith('/master-admin') && !pathname.includes('/login')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      console.log('No admin token found, redirecting to login')
      const response = NextResponse.redirect(new URL('/master-admin/login', request.url))
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }

    try {
      const secret = encoder.encode(JWT_SECRET)
      await jose.jwtVerify(token, secret)
      console.log('Admin token verified successfully')
      const response = NextResponse.next()
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    } catch (error) {
      console.error('Admin token verification failed:', error)
      const response = NextResponse.redirect(new URL('/master-admin/login', request.url))
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected studio routes
    '/studio/:path*',
    '/api/studio/:path*',
    '/master-admin/:path*'
  ]
}