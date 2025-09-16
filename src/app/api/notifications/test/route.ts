import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { pushNotificationService } from '@/lib/push-notification-service'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pushNotificationService.sendTestNotification()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        notificationId: result.notificationId,
        stats: result.stats
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await pushNotificationService.getNotificationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get notification stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get notification statistics' },
      { status: 500 }
    )
  }
}
