import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { JWT_SECRET } from '@/lib/config'

export async function GET() {
  try {
    // Get token from cookie
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      console.log('No token found in cookies')
      return NextResponse.json({ valid: false, message: 'No token found' }, { status: 401 })
    }

    try {
      // Verify token
      const decoded = verify(token.value, JWT_SECRET) as { username: string; role: string }
      console.log('Token verified, decoded:', { ...decoded, token: '[REDACTED]' })

      if (decoded.role !== 'master_admin') {
        console.log('Invalid role:', decoded.role)
        return NextResponse.json({ valid: false, message: 'Invalid role' }, { status: 401 })
      }

      return NextResponse.json({ valid: true, user: { username: decoded.username, role: decoded.role } })

    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      return NextResponse.json({ valid: false, message: 'Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Error in GET /api/master-admin/auth/verify:', error)
    return NextResponse.json({ valid: false, message: 'Internal server error' }, { status: 500 })
  }
} 