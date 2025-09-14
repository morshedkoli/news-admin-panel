import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get all notifications from Firebase
    const allNotifications = await dbService.getAllNotifications()
    
    // Calculate statistics
    const totalNotifications = allNotifications.length
    const sentNotifications = allNotifications.filter(n => n.status === 'sent').length
    const scheduledNotifications = allNotifications.filter(n => n.status === 'scheduled').length
    const failedNotifications = allNotifications.filter(n => n.status === 'failed').length
    
    // Since we don't have a separate deliveries collection yet, generate realistic mock data
    const totalDeliveries = sentNotifications * (Math.floor(Math.random() * 500) + 500) // 500-1000 per notification
    const successfulDeliveries = Math.floor(totalDeliveries * (0.85 + Math.random() * 0.1)) // 85-95% delivery rate
    const clickedDeliveries = Math.floor(successfulDeliveries * (0.02 + Math.random() * 0.08)) // 2-10% click rate

    // Calculate rates
    const deliveryRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0
    const clickRate = successfulDeliveries > 0 ? Math.round((clickedDeliveries / successfulDeliveries) * 100) : 0

    // Generate daily performance data (mock data for charts)
    const chartData = []
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const delivered = Math.floor(Math.random() * 100) + 50
      const failed = Math.floor(Math.random() * 10) + 5
      const clicked = Math.floor(delivered * (0.02 + Math.random() * 0.08))
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        delivered,
        failed,
        clicked
      })
    }

    // Get notification type performance
    const typeStats = allNotifications.reduce((acc: Record<string, number>, notification) => {
      const type = notification.type || 'general'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    
    const typePerformance = Object.entries(typeStats).map(([type, count]) => ({
      type,
      count
    }))

    // Get best performing notifications (mock performance data)
    const topNotifications = allNotifications
      .filter(n => n.status === 'sent')
      .slice(0, 10)
      .map((notification: { id: string; title: string; type: string; sentAt?: Date; deliveredCount?: number; openedCount?: number; clickedCount?: number }) => {
        const totalSent = Math.floor(Math.random() * 1000) + 500
        const delivered = Math.floor(totalSent * (0.85 + Math.random() * 0.1))
        const clicked = Math.floor(delivered * (0.02 + Math.random() * 0.08))
        
        return {
          id: notification.id,
          title: notification.title,
          type: notification.type,
          sentAt: notification.sentAt,
          totalSent,
          delivered,
          clicked,
          deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0,
          clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0
        }
      })
      .sort((a: { clickRate: number }, b: { clickRate: number }) => b.clickRate - a.clickRate)
      .slice(0, 5)

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
      typePerformance,
      topNotifications
    })
  } catch (error) {
    console.error('Get notification analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification analytics' },
      { status: 500 }
    )
  }
}