import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalTokens, activeTokens, androidTokens, iosTokens, recentTokens] = await Promise.all([
      prisma.fCMToken.count(),
      prisma.fCMToken.count({ where: { isActive: true } }),
      prisma.fCMToken.count({ where: { platform: 'android', isActive: true } }),
      prisma.fCMToken.count({ where: { platform: 'ios', isActive: true } }),
      prisma.fCMToken.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          platform: true,
          isActive: true,
          createdAt: true,
          deviceId: true
        }
      })
    ])

    // Get platform distribution
    const platformStats = [
      { platform: 'Android', count: androidTokens, color: '#3DDC84' },
      { platform: 'iOS', count: iosTokens, color: '#007AFF' }
    ]

    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyRegistrations = await prisma.fCMToken.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Format daily registrations for chart
    const registrationTrend = dailyRegistrations.map((item: any) => ({
      date: item.createdAt.toISOString().split('T')[0],
      registrations: item._count.id
    }))

    return NextResponse.json({
      stats: {
        totalTokens,
        activeTokens,
        inactiveTokens: totalTokens - activeTokens,
        androidTokens,
        iosTokens
      },
      platformStats,
      registrationTrend,
      recentTokens
    })
  } catch (error) {
    console.error('Get tokens stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, deviceId, platform, userId } = body

    if (!token || !deviceId || !platform) {
      return NextResponse.json(
        { error: 'Token, deviceId, and platform are required' },
        { status: 400 }
      )
    }

    // Create or update FCM token
    const fcmToken = await prisma.fCMToken.upsert({
      where: { deviceId },
      update: {
        token,
        platform,
        userId,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        token,
        deviceId,
        platform,
        userId,
        isActive: true
      }
    })

    return NextResponse.json(fcmToken)
  } catch (error) {
    console.error('Register token error:', error)
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    )
  }
}