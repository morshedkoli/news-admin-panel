import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get top performing articles by views
    const topArticles = await prisma.news.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        views: true,
        likes: true,
        shares: true,
        publishedAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 10
    })

    // Get category performance
    const categoryPerformance = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        news: {
          select: {
            views: true,
            likes: true,
            shares: true
          },
          where: {
            isPublished: true
          }
        }
      }
    })

    // Calculate category stats
    const categoryStats = categoryPerformance.map((category: any) => ({
      name: category.name,
      articles: category.news.length,
      totalViews: category.news.reduce((sum: number, article: any) => sum + (article.views || 0), 0),
      totalLikes: category.news.reduce((sum: number, article: any) => sum + (article.likes || 0), 0),
      totalShares: category.news.reduce((sum: number, article: any) => sum + (article.shares || 0), 0),
      avgViews: category.news.length > 0 
        ? Math.round(category.news.reduce((sum: number, article: any) => sum + (article.views || 0), 0) / category.news.length)
        : 0
    })).sort((a: any, b: any) => b.totalViews - a.totalViews)

    // Get recent activity (last 10 user engagement actions)
    const recentActivity = await prisma.userEngagement.findMany({
      select: {
        action: true,
        timestamp: true,
        device: true,
        location: true,
        newsId: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      topArticles,
      categoryStats,
      recentActivity
    })
  } catch (error) {
    console.error('Analytics performance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    )
  }
}