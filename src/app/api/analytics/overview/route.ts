import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current date and date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)
    const thisMonth = new Date(today)
    thisMonth.setMonth(thisMonth.getMonth() - 1)

    // Get total statistics
    const [
      totalNews,
      publishedNews,
      draftNews,
      totalCategories,
      totalViews,
      totalLikes,
      totalShares,
      todayViews,
      yesterdayViews,
      thisWeekViews,
      thisMonthViews
    ] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({ where: { isPublished: true } }),
      prisma.news.count({ where: { isPublished: false } }),
      prisma.category.count(),
      prisma.news.aggregate({ _sum: { views: true } }),
      prisma.news.aggregate({ _sum: { likes: true } }),
      prisma.news.aggregate({ _sum: { shares: true } }),
      prisma.newsAnalytics.aggregate({
        _sum: { views: true },
        where: { date: { gte: today } }
      }),
      prisma.newsAnalytics.aggregate({
        _sum: { views: true },
        where: { 
          date: { 
            gte: yesterday,
            lt: today
          }
        }
      }),
      prisma.newsAnalytics.aggregate({
        _sum: { views: true },
        where: { date: { gte: thisWeek } }
      }),
      prisma.newsAnalytics.aggregate({
        _sum: { views: true },
        where: { date: { gte: thisMonth } }
      })
    ])

    // Calculate growth percentages
    const todayViewsCount = todayViews._sum.views || 0
    const yesterdayViewsCount = yesterdayViews._sum.views || 0
    const viewsGrowth = yesterdayViewsCount > 0 
      ? ((todayViewsCount - yesterdayViewsCount) / yesterdayViewsCount) * 100 
      : 0

    return NextResponse.json({
      overview: {
        totalNews,
        publishedNews,
        draftNews,
        totalCategories,
        totalViews: totalViews._sum.views || 0,
        totalLikes: totalLikes._sum.likes || 0,
        totalShares: totalShares._sum.shares || 0,
        todayViews: todayViewsCount,
        yesterdayViews: yesterdayViewsCount,
        thisWeekViews: thisWeekViews._sum.views || 0,
        thisMonthViews: thisMonthViews._sum.views || 0,
        viewsGrowth: Math.round(viewsGrowth * 100) / 100
      }
    })
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}