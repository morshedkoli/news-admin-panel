import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Get all published news articles
    const publishedNews = await prisma.news.findMany({
      where: { isPublished: true }
    })

    if (publishedNews.length === 0) {
      return NextResponse.json({ message: 'No published articles found to generate analytics' })
    }

    // Generate sample analytics data for the last 30 days
    const today = new Date()
    const analyticsData = []
    const engagementData = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      // Generate analytics for each article
      for (const article of publishedNews) {
        // Generate random but realistic analytics data
        const baseViews = Math.floor(Math.random() * 100) + 10
        const views = Math.max(1, Math.floor(baseViews * (1 - i * 0.02))) // Decreasing trend
        const likes = Math.floor(views * (0.05 + Math.random() * 0.15)) // 5-20% like rate
        const shares = Math.floor(likes * (0.1 + Math.random() * 0.3)) // 10-40% of likes are shares

        analyticsData.push({
          newsId: article.id,
          date,
          views,
          likes,
          shares,
          readTime: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          source: ['direct', 'social', 'search', 'referral'][Math.floor(Math.random() * 4)],
          device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          location: ['US', 'UK', 'CA', 'AU', 'IN'][Math.floor(Math.random() * 5)]
        })

        // Generate user engagement events
        for (let j = 0; j < views; j++) {
          engagementData.push({
            sessionId: `session_${article.id}_${i}_${j}`,
            newsId: article.id,
            action: 'view',
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
            location: ['US', 'UK', 'CA', 'AU', 'IN'][Math.floor(Math.random() * 5)],
            duration: Math.floor(Math.random() * 300) + 30
          })
        }

        // Generate like events
        for (let j = 0; j < likes; j++) {
          engagementData.push({
            sessionId: `session_${article.id}_${i}_like_${j}`,
            newsId: article.id,
            action: 'like',
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
            location: ['US', 'UK', 'CA', 'AU', 'IN'][Math.floor(Math.random() * 5)]
          })
        }

        // Generate share events
        for (let j = 0; j < shares; j++) {
          engagementData.push({
            sessionId: `session_${article.id}_${i}_share_${j}`,
            newsId: article.id,
            action: 'share',
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
            location: ['US', 'UK', 'CA', 'AU', 'IN'][Math.floor(Math.random() * 5)]
          })
        }
      }
    }

    // Insert analytics data
    await prisma.newsAnalytics.createMany({
      data: analyticsData
    })

    // Insert engagement data
    await prisma.userEngagement.createMany({
      data: engagementData
    })

    // Update total counts in News table
    for (const article of publishedNews) {
      const totalViews = analyticsData
        .filter(a => a.newsId === article.id)
        .reduce((sum, a) => sum + a.views, 0)
      
      const totalLikes = analyticsData
        .filter(a => a.newsId === article.id)
        .reduce((sum, a) => sum + a.likes, 0)
      
      const totalShares = analyticsData
        .filter(a => a.newsId === article.id)
        .reduce((sum, a) => sum + a.shares, 0)

      await prisma.news.update({
        where: { id: article.id },
        data: {
          views: totalViews,
          likes: totalLikes,
          shares: totalShares
        }
      })
    }

    return NextResponse.json({
      message: 'Sample analytics data generated successfully',
      articlesProcessed: publishedNews.length,
      analyticsRecords: analyticsData.length,
      engagementRecords: engagementData.length
    })
  } catch (error) {
    console.error('Seed analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to generate sample analytics data' },
      { status: 500 }
    )
  }
}