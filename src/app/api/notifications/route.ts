import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    const skip = (page - 1) * limit
    
    // Build filter
    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    
    // Get notifications with delivery stats
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          deliveries: {
            select: {
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])
    
    // Calculate delivery stats for each notification
    const notificationsWithStats = notifications.map((notification: any) => {
      const deliveries = notification.deliveries
      const totalDeliveries = deliveries.length
      const delivered = deliveries.filter((d: any) => d.status === 'delivered').length
      const failed = deliveries.filter((d: any) => d.status === 'failed').length
      const clicked = deliveries.filter((d: any) => d.status === 'clicked').length
      
      return {
        ...notification,
        stats: {
          totalDeliveries,
          delivered,
          failed,
          clicked,
          deliveryRate: totalDeliveries > 0 ? Math.round((delivered / totalDeliveries) * 100) : 0,
          clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0
        },
        deliveries: undefined // Remove deliveries from response
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
    if (!session?.user) {
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
    const notification = await prisma.notification.create({
      data: {
        title,
        body: notificationBody,
        imageUrl,
        newsId,
        type,
        targetType,
        targetValue,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: session.user.id
      }
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