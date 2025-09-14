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

    // Get basic stats
    const newsStats = await dbService.getNewsStats()
    
    // Get all news to calculate totals
    const allNews = await dbService.getAllNews({ page: 1, limit: 1000 }) // Get all news
    
    // Calculate total views, likes, and shares
    let totalViews = 0
    let totalLikes = 0
    let totalShares = 0
    
    allNews.news.forEach(article => {
      totalViews += article.views || 0
      totalLikes += article.likes || 0
      totalShares += article.shares || 0
    })

    // Calculate period-specific stats (mock data for now - in real app you'd track this)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // For demo purposes, generate some realistic numbers based on total views
    const todayViews = Math.floor(totalViews * 0.05) // 5% of total views today
    const yesterdayViews = Math.floor(totalViews * 0.04) // 4% yesterday
    const thisWeekViews = Math.floor(totalViews * 0.25) // 25% this week
    const thisMonthViews = Math.floor(totalViews * 0.6) // 60% this month
    
    // Calculate growth (percentage change from yesterday)
    const viewsGrowth = yesterdayViews > 0 
      ? ((todayViews - yesterdayViews) / yesterdayViews) * 100
      : todayViews > 0 ? 100 : 0

    const overview = {
      totalNews: newsStats.totalNews,
      publishedNews: newsStats.publishedNews,
      draftNews: newsStats.draftNews,
      totalCategories: newsStats.totalCategories,
      totalViews,
      totalLikes,
      totalShares,
      todayViews,
      yesterdayViews,
      thisWeekViews,
      thisMonthViews,
      viewsGrowth
    }

    return NextResponse.json({ overview })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}