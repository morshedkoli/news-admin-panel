import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all news articles with category information
    const allNews = await dbService.getAllNews({ page: 1, limit: 1000 })
    
    // Get categories for category stats
    const categories = await dbService.getAllCategories()
    
    // Populate category information for news articles
    const newsWithCategories = await Promise.all(
      allNews.news.map(async (newsItem) => {
        const categoryData = await dbService.getCategoryById(newsItem.categoryId)
        return {
          ...newsItem,
          category: categoryData || { id: newsItem.categoryId, name: 'Unknown', slug: 'unknown' }
        }
      })
    )

    // Get top articles sorted by views
    const topArticles = newsWithCategories
      .filter(article => article.isPublished)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(article => ({
        id: article.id,
        title: article.title,
        views: article.views || 0,
        likes: article.likes || 0,
        shares: article.shares || 0,
        publishedAt: article.publishedAt?.toISOString() || null,
        category: {
          name: article.category?.name || 'Unknown'
        }
      }))

    // Calculate category statistics
    const categoryStatsMap = new Map()
    
    categories.forEach(category => {
      categoryStatsMap.set(category.id, {
        name: category.name,
        articles: 0,
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        avgViews: 0
      })
    })

    newsWithCategories.forEach(article => {
      if (article.isPublished) {
        const categoryId = article.categoryId
        const stats = categoryStatsMap.get(categoryId)
        
        if (stats) {
          stats.articles += 1
          stats.totalViews += article.views || 0
          stats.totalLikes += article.likes || 0
          stats.totalShares += article.shares || 0
        }
      }
    })

    // Calculate average views and convert to array
    const categoryStats = Array.from(categoryStatsMap.values())
      .map(stats => ({
        ...stats,
        avgViews: stats.articles > 0 ? Math.round(stats.totalViews / stats.articles) : 0
      }))
      .sort((a, b) => b.totalViews - a.totalViews) // Sort by total views

    // Generate recent activity (mock data for demonstration)
    const recentActivity = []
    const activities = ['view', 'like', 'share']
    const devices = ['Mobile', 'Desktop', 'Tablet']
    const locations = ['New York', 'London', 'Tokyo', 'San Francisco', 'Berlin', 'Sydney']
    
    for (let i = 0; i < 10; i++) {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      const randomDevice = devices[Math.floor(Math.random() * devices.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const randomNews = topArticles[Math.floor(Math.random() * Math.min(topArticles.length, 3))]
      
      const timestamp = new Date()
      timestamp.setMinutes(timestamp.getMinutes() - (i * 15 + Math.random() * 30))
      
      recentActivity.push({
        action: randomActivity,
        timestamp: timestamp.toISOString(),
        device: randomDevice,
        location: randomLocation,
        newsId: randomNews?.id || null
      })
    }

    return NextResponse.json({
      topArticles,
      categoryStats,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching analytics performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics performance' },
      { status: 500 }
    )
  }
}