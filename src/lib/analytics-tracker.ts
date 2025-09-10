import { prisma } from '@/lib/prisma'

interface AnalyticsEvent {
  newsId: string
  action: 'view' | 'like' | 'share'
  sessionId?: string
  device?: string
  location?: string
  duration?: number
}

export class AnalyticsTracker {
  /**
   * Track a user interaction with a news article
   */
  static async trackEvent(event: AnalyticsEvent) {
    try {
      // Record the engagement event
      await prisma.userEngagement.create({
        data: {
          sessionId: event.sessionId || `session_${Date.now()}`,
          newsId: event.newsId,
          action: event.action,
          timestamp: new Date(),
          device: event.device,
          location: event.location,
          duration: event.duration
        }
      })

      // Update daily analytics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingAnalytics = await prisma.newsAnalytics.findFirst({
        where: {
          newsId: event.newsId,
          date: today
        }
      })

      if (existingAnalytics) {
        // Update existing record
        const updates: any = {}
        if (event.action === 'view') updates.views = { increment: 1 }
        if (event.action === 'like') updates.likes = { increment: 1 }
        if (event.action === 'share') updates.shares = { increment: 1 }

        await prisma.newsAnalytics.update({
          where: { id: existingAnalytics.id },
          data: updates
        })
      } else {
        // Create new analytics record for today
        await prisma.newsAnalytics.create({
          data: {
            newsId: event.newsId,
            date: today,
            views: event.action === 'view' ? 1 : 0,
            likes: event.action === 'like' ? 1 : 0,
            shares: event.action === 'share' ? 1 : 0,
            readTime: event.duration || 0,
            source: 'direct',
            device: event.device,
            location: event.location
          }
        })
      }

      // Update the main news record totals
      const updates: any = {}
      if (event.action === 'view') updates.views = { increment: 1 }
      if (event.action === 'like') updates.likes = { increment: 1 }
      if (event.action === 'share') updates.shares = { increment: 1 }

      await prisma.news.update({
        where: { id: event.newsId },
        data: updates
      })

      return { success: true }
    } catch (error) {
      console.error('Analytics tracking error:', error)
      return { success: false, error }
    }
  }

  /**
   * Get analytics summary for a specific article
   */
  static async getArticleAnalytics(newsId: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const analytics = await prisma.newsAnalytics.findMany({
        where: {
          newsId,
          date: { gte: startDate }
        },
        orderBy: { date: 'asc' }
      })

      const totalViews = analytics.reduce((sum: number, a: any) => sum + a.views, 0)
      const totalLikes = analytics.reduce((sum: number, a: any) => sum + a.likes, 0)
      const totalShares = analytics.reduce((sum: number, a: any) => sum + a.shares, 0)
      const avgReadTime = analytics.length > 0 
        ? Math.round(analytics.reduce((sum: number, a: any) => sum + a.readTime, 0) / analytics.length)
        : 0

      return {
        success: true,
        data: {
          totalViews,
          totalLikes,
          totalShares,
          avgReadTime,
          dailyAnalytics: analytics,
          engagementRate: totalViews > 0 ? ((totalLikes + totalShares) / totalViews * 100) : 0
        }
      }
    } catch (error) {
      console.error('Get article analytics error:', error)
      return { success: false, error }
    }
  }

  /**
   * Get top performing articles for a date range
   */
  static async getTopArticles(limit: number = 10, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const topArticles = await prisma.news.findMany({
        where: {
          isPublished: true,
          publishedAt: { gte: startDate }
        },
        select: {
          id: true,
          title: true,
          views: true,
          likes: true,
          shares: true,
          publishedAt: true,
          category: {
            select: { name: true }
          }
        },
        orderBy: { views: 'desc' },
        take: limit
      })

      return { success: true, data: topArticles }
    } catch (error) {
      console.error('Get top articles error:', error)
      return { success: false, error }
    }
  }

  /**
   * Get engagement metrics for dashboard
   */
  static async getEngagementMetrics(days: number = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const engagement = await prisma.userEngagement.groupBy({
        by: ['action'],
        _count: { action: true },
        where: {
          timestamp: { gte: startDate }
        }
      })

      const metrics = engagement.reduce((acc: any, item: any) => {
        acc[item.action] = item._count.action
        return acc
      }, { view: 0, like: 0, share: 0 })

      return { success: true, data: metrics }
    } catch (error) {
      console.error('Get engagement metrics error:', error)
      return { success: false, error }
    }
  }
}