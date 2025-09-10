import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Firebase Admin SDK for sending push notifications
interface FCMPayload {
  notification: {
    title: string
    body: string
    image?: string
  }
  data?: {
    [key: string]: string
  }
  token: string
}

// Mock FCM service - Replace with actual Firebase Admin SDK
async function sendFCMNotification(payload: FCMPayload): Promise<{ success: boolean; error?: string }> {
  try {
    // This is a mock implementation
    // In production, use Firebase Admin SDK:
    // const response = await admin.messaging().send(payload)
    
    console.log('Sending FCM notification:', payload)
    
    // Simulate success/failure
    const isSuccess = Math.random() > 0.1 // 90% success rate
    
    if (isSuccess) {
      return { success: true }
    } else {
      return { success: false, error: 'FCM delivery failed' }
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Get notification details
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.status === 'sent') {
      return NextResponse.json(
        { error: 'Notification already sent' },
        { status: 400 }
      )
    }

    // Get target tokens based on targetType
    let tokens: any[] = []

    if (notification.targetType === 'all') {
      tokens = await prisma.fcmToken.findMany({
        where: { isActive: true }
      })
    } else if (notification.targetType === 'category' && notification.targetValue) {
      // For category-based targeting, you might need to implement user preferences
      tokens = await prisma.fcmToken.findMany({
        where: { isActive: true }
      })
    } else if (notification.targetType === 'specific' && notification.targetValue) {
      const tokenIds = notification.targetValue.split(',')
      tokens = await prisma.fcmToken.findMany({
        where: {
          id: { in: tokenIds },
          isActive: true
        }
      })
    }

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'No active tokens found for the target criteria' },
        { status: 400 }
      )
    }

    // Update notification status to sending
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        status: 'sending',
        sentAt: new Date()
      }
    })

    // Send notifications to all tokens
    const deliveryPromises = tokens.map(async (token: any) => {
      const payload: FCMPayload = {
        notification: {
          title: notification.title,
          body: notification.body,
          image: notification.imageUrl || undefined
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          newsId: notification.newsId || ''
        },
        token: token.token
      }

      const result = await sendFCMNotification(payload)

      // Create delivery record
      return prisma.notificationDelivery.create({
        data: {
          notificationId: notification.id,
          tokenId: token.id,
          status: result.success ? 'delivered' : 'failed',
          sentAt: new Date(),
          deliveredAt: result.success ? new Date() : null,
          errorMessage: result.error || null
        }
      })
    })

    // Wait for all deliveries to complete
    const deliveries = await Promise.allSettled(deliveryPromises)
    const successfulDeliveries = deliveries.filter(d => d.status === 'fulfilled').length
    const failedDeliveries = deliveries.length - successfulDeliveries

    // Update notification status
    const finalStatus = failedDeliveries === 0 ? 'sent' : 'partially_sent'
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: finalStatus }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      stats: {
        totalTokens: tokens.length,
        successful: successfulDeliveries,
        failed: failedDeliveries
      }
    })
  } catch (error) {
    console.error('Send notification error:', error)
    
    // Update notification status to failed if something went wrong
    try {
      const { notificationId } = await request.json()
      if (notificationId) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'failed' }
        })
      }
    } catch (updateError) {
      console.error('Failed to update notification status:', updateError)
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}