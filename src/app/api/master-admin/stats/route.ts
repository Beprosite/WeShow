import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/config'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      console.log('Stats API: No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Verify token
      const decoded = verify(token, JWT_SECRET) as { id: string; role: string }
      
      if (decoded.role !== 'master_admin') {
        console.log('Stats API: Invalid role:', decoded.role)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get all studios with their related clients and projects
      const studios = await prisma.studio.findMany({
        where: {
          masterAdminId: decoded.id
        },
        include: {
          clients: true,
          projects: true
        }
      })

      // Calculate statistics
      const totalStudios = studios.length
      const activeStudios = studios.filter(studio => studio.isActive).length
      
      // Calculate total clients and projects
      const totalClients = studios.reduce((acc, studio) => acc + studio.clients.length, 0)
      const totalProjects = studios.reduce((acc, studio) => acc + studio.projects.length, 0)
      
      // Calculate total revenue from all projects
      const totalRevenue = studios.reduce((acc, studio) => {
        return acc + studio.projects.reduce((pAcc, project) => pAcc + (project.cost || 0), 0)
      }, 0)

      // Get subscription tiers distribution
      const subscriptionTiers = studios.reduce((acc, studio) => {
        const tier = studio.subscriptionTier || 'FREE'
        acc[tier] = (acc[tier] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get recent studios with their stats
      const recentStudios = studios.slice(0, 5).map(studio => ({
        id: studio.id,
        name: studio.name,
        email: studio.email,
        clientCount: studio.clients.length,
        projectCount: studio.projects.length,
        isActive: studio.isActive
      }))

      console.log('Stats API: Successfully calculated stats')
      return NextResponse.json({
        totalStudios,
        activeStudios,
        totalClients,
        totalProjects,
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        subscriptionTiers,
        recentStudios
      })

    } catch (verifyError) {
      console.error('Stats API: Token verification failed:', verifyError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error('Stats API: Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
} 