import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { JWT_SECRET } from '@/lib/config'

export async function GET() {
  try {
    // Get token from cookie
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      console.log('No token found in cookies')
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    // Verify token
    try {
      const decoded = verify(token.value, JWT_SECRET) as { id: string; role: string }
      console.log('Token verified, decoded:', decoded)

      if (decoded.role !== 'master_admin') {
        console.log('Invalid role:', decoded.role)
        return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 401 })
      }

      // Fetch studios with counts
      const studios = await prisma.studio.findMany({
        include: {
          _count: {
            select: {
              clients: true,
              projects: true
            }
          }
        }
      })

      console.log(`Found ${studios.length} studios`)
      return NextResponse.json(studios)

    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Error in GET /api/master-admin/studios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 