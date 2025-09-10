import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get notification statistics
    const [
      totalNotifications,
      sentNotifications,
      scheduledNotifications,
      failedNotifications,
      totalDeliveries,
      successfulDeliveries,
      clickedDeliveries
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'sent' } }),
      prisma.notification.count({ where: { status: 'scheduled' } }),
      prisma.notification.count({ where: { status: 'failed' } }),
      prisma.notificationDelivery.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.notificationDelivery.count({
        where: { 
          status: 'delivered',
          createdAt: { gte: startDate }
        }
      }),
      prisma.notificationDelivery.count({
        where: { 
          status: 'clicked',
          createdAt: { gte: startDate }
        }
      })
    ])

    // Calculate rates
    const deliveryRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0
    const clickRate = successfulDeliveries > 0 ? Math.round((clickedDeliveries / successfulDeliveries) * 100) : 0

    // Get daily performance data
    const dailyPerformance = await prisma.notificationDelivery.groupBy({
      by: ['createdAt', 'status'],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Format daily performance for charts
    const performanceData = dailyPerformance.reduce((acc: any, item: any) => {
      const date = item.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, delivered: 0, failed: 0, clicked: 0 }
      }
      acc[date][item.status] = item._count.id
      return acc
    }, {})

    const chartData = Object.values(performanceData)

    // Get notification type performance
    const typePerformance = await prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true },
      _avg: {
        // We'll calculate this from deliveries
      },
      where: {
        createdAt: { gte: startDate }
      }
    })

    // Get best performing notifications
    const topNotifications = await prisma.notification.findMany({
      where: {
        status: 'sent',
        createdAt: { gte: startDate }
      },
      include: {
        deliveries: {
          select: {
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate performance for each notification
    const notificationPerformance = topNotifications.map((notification: any) => {
      const deliveries = notification.deliveries
      const total = deliveries.length
      const delivered = deliveries.filter((d: any) => d.status === 'delivered').length
      const clicked = deliveries.filter((d: any) => d.status === 'clicked').length
      
      return {
        id: notification.id,
        title: notification.title,
        type: notification.type,
        sentAt: notification.sentAt,
        totalSent: total,
        delivered,
        clicked,
        deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
        clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0
      }
    }).sort((a: any, b: any) => b.clickRate - a.clickRate)

    return NextResponse.json({
      overview: {
        totalNotifications,
        sentNotifications,
        scheduledNotifications,
        failedNotifications,
        totalDeliveries,
        successfulDeliveries,
        clickedDeliveries,
        deliveryRate,
        clickRate
      },
      chartData,
      typePerformance: typePerformance.map((item: any) => ({
        type: item.type,
        count: item._count.id
      })),
      topNotifications: notificationPerformance.slice(0, 5)
    })
  } catch (error) {
    console.error('Get notification analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification analytics' },
      { status: 500 }
    )
  }
}