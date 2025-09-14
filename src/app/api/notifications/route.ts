import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    // Get all notifications (Firebase doesn't have complex filtering like Prisma)
    const allNotifications = await dbService.getAllNotifications()
    
    // Filter notifications based on query params
    let filteredNotifications = allNotifications
    if (status && status !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === status)
    }
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }
    
    const total = filteredNotifications.length
    const skip = (page - 1) * limit
    const notifications = filteredNotifications.slice(skip, skip + limit)
    
    // Calculate delivery stats for each notification (mock data for now)
    const notificationsWithStats = notifications.map((notification: { id: string; title: string; body: string; type: string; createdAt: Date; deliveredCount?: number; openedCount?: number; clickedCount?: number }) => {
      // For Firebase, we'll use mock delivery stats since we don't have a separate deliveries collection yet
      const totalDeliveries = Math.floor(Math.random() * 1000) + 100
      const delivered = Math.floor(totalDeliveries * (0.85 + Math.random() * 0.1)) // 85-95% delivery rate
      const failed = totalDeliveries - delivered
      const clicked = Math.floor(delivered * (0.02 + Math.random() * 0.08)) // 2-10% click rate
      
      return {
        ...notification,
        stats: {
          totalDeliveries,
          delivered,
          failed,
          clicked,
          deliveryRate: totalDeliveries > 0 ? Math.round((delivered / totalDeliveries) * 100) : 0,
          clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0
        }
      }
    })
    
    return NextResponse.json({
      notifications: notificationsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      body: notificationBody, 
      imageUrl, 
      newsId, 
      type = 'general',
      targetType = 'all',
      targetValue,
      scheduledAt 
    } = body

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = await dbService.createNotification({
      title,
      body: notificationBody,
      imageUrl,
      newsId,
      type,
      targetType,
      targetValue,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: (session as { user?: { id: string } })?.user?.id || 'anonymous'
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}