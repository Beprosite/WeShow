import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sign } from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    console.log('Login attempt:', { username })

    const admin = await prisma.masterAdmin.findUnique({
      where: { username }
    })

    if (!admin || admin.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = sign(
      { id: admin.id, role: 'master_admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Set cookie directly in headers
    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    )

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 