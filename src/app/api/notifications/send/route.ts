import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

import { messaging } from '@/lib/firebase-admin'

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

// Real FCM service using Firebase Admin SDK
async function sendFCMNotification(payload: FCMPayload): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const message = {
      notification: payload.notification,
      data: payload.data || {},
      token: payload.token,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#3b82f6',
          sound: 'default',
          channelId: 'news_updates'
        },
        priority: 'high' as const
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title: payload.notification.title,
              body: payload.notification.body
            }
          }
        }
      }
    }
    
    const response = await messaging.send(message)
    console.log('FCM notification sent successfully:', response)
    
    return { success: true, messageId: response }
  } catch (error) {
    console.error('FCM notification failed:', error)
    
    // Handle specific FCM errors
    if (error instanceof Error) {
      if (error.message.includes('registration-token-not-registered')) {
        return { success: false, error: 'Token no longer valid' }
      }
      if (error.message.includes('invalid-registration-token')) {
        return { success: false, error: 'Invalid token format' }
      }
      if (error.message.includes('message-rate-exceeded')) {
        return { success: false, error: 'Rate limit exceeded' }
      }
    }
    
    return { success: false, error: (error as Error).message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { role: string } }
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
    const notification = await dbService.getNotificationById(notificationId)

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
    let tokens: { id: string; token: string; userId?: string }[] = []

    if (notification.targetType === 'all') {
      tokens = await dbService.getAllActiveFCMTokens()
    } else if (notification.targetType === 'category' && notification.targetValue) {
      // For category-based targeting, you might need to implement user preferences
      tokens = await dbService.getAllActiveFCMTokens()
    } else if (notification.targetType === 'specific' && notification.targetValue) {
      const tokenIds = notification.targetValue.split(',')
      const allTokens = await dbService.getAllActiveFCMTokens()
      tokens = allTokens.filter(token => tokenIds.includes(token.id))
    }

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'No active tokens found for the target criteria' },
        { status: 400 }
      )
    }

    // Update notification status to sending
    await dbService.updateNotification(notificationId, { 
      status: 'sending',
      sentAt: new Date()
    })

    // Send notifications to all tokens
    const deliveryPromises = tokens.map(async (token: { id: string; token: string; userId?: string }) => {
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
        token: token.token,
      }

      const result = await sendFCMNotification(payload)

      // Create delivery record (mock implementation)
      return {
        id: `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notificationId: notification.id,
        tokenId: token.id,
        status: result.success ? 'delivered' : 'failed',
        sentAt: new Date(),
        deliveredAt: result.success ? new Date() : null,
        errorMessage: result.error || null
      }
    })

    // Wait for all deliveries to complete
    const deliveries = await Promise.allSettled(deliveryPromises)
    const successfulDeliveries = deliveries.filter(d => d.status === 'fulfilled').length
    const failedDeliveries = deliveries.length - successfulDeliveries

    // Update notification status
    const finalStatus = failedDeliveries === 0 ? 'sent' : 'partially_sent'
    await dbService.updateNotification(notificationId, { status: finalStatus })

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
        await dbService.updateNotification(notificationId, { status: 'failed' })
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