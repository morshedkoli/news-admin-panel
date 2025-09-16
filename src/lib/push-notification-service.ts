// Push Notification Service for News App Admin Panel
// Handles automatic push notifications for news articles

import { messaging } from './firebase-admin'
import { dbService } from './db'

export interface PushNotificationPayload {
  title: string
  body: string
  imageUrl?: string
  newsId?: string
  type: 'news' | 'general' | 'promotion' | 'alert'
  targetType: 'all' | 'category' | 'specific'
  targetValue?: string
  data?: Record<string, string>
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  stats?: {
    totalTokens: number
    successful: number
    failed: number
  }
  error?: string
}

class PushNotificationService {
  /**
   * Send push notification for new news article
   */
  async sendNewsNotification(newsId: string, categoryId?: string): Promise<NotificationResult> {
    try {
      // Check if notifications are enabled
      const settings = await dbService.getSettings()
      if (!settings.notifications.enablePushNotifications || !settings.notifications.notifyOnNewNews) {
        return { success: false, error: 'Push notifications disabled in settings' }
      }

      // Get news details
      const news = await dbService.getNewsById(newsId)
      if (!news) {
        return { success: false, error: 'News article not found' }
      }

      // Get category information
      const category = await dbService.getCategoryById(news.categoryId)
      
      const payload: PushNotificationPayload = {
        title: `📰 New ${category?.name || 'News'} Article`,
        body: news.title,
        imageUrl: news.imageUrl,
        newsId: news.id,
        type: 'news',
        targetType: 'all',
        data: {
          newsId: news.id,
          category: category?.name || 'General',
          action: 'open_article'
        }
      }

      return await this.sendNotification(payload)
    } catch (error) {
      console.error('Error sending news notification:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Send custom push notification
   */
  async sendNotification(payload: PushNotificationPayload): Promise<NotificationResult> {
    try {
      // Create notification record
      const notification = await dbService.createNotification({
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        newsId: payload.newsId,
        type: payload.type,
        targetType: payload.targetType,
        targetValue: payload.targetValue,
        status: 'sending',
        createdBy: 'system',
        sentAt: new Date()
      })

      // Get target tokens
      const tokens = await this.getTargetTokens(payload.targetType, payload.targetValue)
      
      if (tokens.length === 0) {
        await dbService.updateNotification(notification.id, { status: 'failed' })
        return { 
          success: false, 
          error: 'No active tokens found',
          notificationId: notification.id,
          stats: { totalTokens: 0, successful: 0, failed: 0 }
        }
      }

      // Prepare FCM message
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.imageUrl
        },
        data: {
          notificationId: notification.id,
          type: payload.type,
          ...payload.data
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#3b82f6',
            sound: 'default',
            channelId: 'news_updates',
            priority: 'high' as const,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              alert: {
                title: payload.title,
                body: payload.body
              },
              category: 'NEWS_CATEGORY'
            }
          }
        },
        tokens: tokens.map(t => t.token)
      }

      // Send notification
      const response = await messaging.sendEachForMulticast(message)
      
      // Update notification status
      const finalStatus = response.failureCount === 0 ? 'sent' : 'partially_sent'
      await dbService.updateNotification(notification.id, { status: finalStatus })

      // Handle failed tokens
      await this.handleFailedTokens(response, tokens)

      return {
        success: true,
        notificationId: notification.id,
        stats: {
          totalTokens: tokens.length,
          successful: response.successCount,
          failed: response.failureCount
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Send notification to specific category subscribers
   */
  async sendCategoryNotification(categoryId: string, payload: Omit<PushNotificationPayload, 'targetType' | 'targetValue'>): Promise<NotificationResult> {
    return await this.sendNotification({
      ...payload,
      targetType: 'category',
      targetValue: categoryId
    })
  }

  /**
   * Get tokens based on target criteria
   */
  private async getTargetTokens(targetType: string, targetValue?: string) {
    switch (targetType) {
      case 'all':
        return await dbService.getAllActiveFCMTokens()
      
      case 'category':
        // For now, return all tokens. In the future, implement user preferences
        return await dbService.getAllActiveFCMTokens()
      
      case 'specific':
        if (!targetValue) return []
        const tokenIds = targetValue.split(',')
        const allTokens = await dbService.getAllActiveFCMTokens()
        return allTokens.filter(token => tokenIds.includes(token.id))
      
      default:
        return []
    }
  }

  /**
   * Handle failed token deliveries
   */
  private async handleFailedTokens(response: { responses?: Array<{ success: boolean; error?: { code: string } }> }, tokens: Array<{ id: string; token: string; userId?: string; deviceId: string; platform: string; isActive: boolean }>) {
    if (!response.responses) return

    const failedTokens = response.responses
      .map((resp: { success: boolean; error?: { code: string } }, idx: number) => ({ response: resp, token: tokens[idx] }))
      .filter(({ response }: { response: { success: boolean; error?: { code: string } } }) => !response.success)

    for (const { response, token } of failedTokens) {
      if (response.error?.code === 'messaging/registration-token-not-registered' ||
          response.error?.code === 'messaging/invalid-registration-token') {
        // Mark token as inactive
        await dbService.createOrUpdateFCMToken({
          token: token.token,
          deviceId: token.deviceId,
          platform: token.platform,
          isActive: false,
          userId: token.userId
        })
      }
    }
  }

  /**
   * Test notification functionality
   */
  async sendTestNotification(): Promise<NotificationResult> {
    const payload: PushNotificationPayload = {
      title: '🔔 Test Notification',
      body: 'This is a test notification from your news admin panel',
      type: 'general',
      targetType: 'all',
      data: {
        type: 'test',
        action: 'test_notification'
      }
    }

    return await this.sendNotification(payload)
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(payload: PushNotificationPayload, scheduledAt: Date): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const notification = await dbService.createNotification({
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        newsId: payload.newsId,
        type: payload.type,
        targetType: payload.targetType,
        targetValue: payload.targetValue,
        status: 'scheduled',
        scheduledAt,
        createdBy: 'system'
      })

      return { success: true, notificationId: notification.id }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const notifications = await dbService.getAllNotifications()
      const tokens = await dbService.getAllActiveFCMTokens()

      const stats = {
        totalNotifications: notifications.length,
        sentNotifications: notifications.filter(n => n.status === 'sent').length,
        failedNotifications: notifications.filter(n => n.status === 'failed').length,
        scheduledNotifications: notifications.filter(n => n.status === 'scheduled').length,
        totalSubscribers: tokens.length,
        activeSubscribers: tokens.filter(t => t.isActive).length,
        recentNotifications: notifications.slice(0, 5)
      }

      return stats
    } catch (error) {
      console.error('Error getting notification stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()
export default PushNotificationService
