import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as jose from 'jose'
import { JWT_SECRET } from '@/lib/config'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const encoder = new TextEncoder()

export async function POST(request: Request) {
  try {
    console.log('Auth endpoint: Starting login process')
    const { username, password } = await request.json()
    console.log('Auth endpoint: Received credentials for:', { username })

    const admin = await prisma.masterAdmin.findUnique({
      where: { username }
    })
    console.log('Auth endpoint: Database lookup result:', { found: !!admin })

    if (!admin) {
      console.log('Auth endpoint: Admin not found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      console.log('Auth endpoint: Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Auth endpoint: Creating JWT token')
    // Create JWT using jose
    const secret = encoder.encode(JWT_SECRET)
    const token = await new jose.SignJWT({ id: admin.id, role: 'master_admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)
    console.log('Auth endpoint: JWT token created')

    // Create response with token in both body and cookie
    const response = NextResponse.json({ token })

    console.log('Auth endpoint: Setting cookie')
    // Set the token cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours in seconds
    })
    console.log('Auth endpoint: Cookie set, sending response')

    return response

  } catch (error) {
    console.error('Auth endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 