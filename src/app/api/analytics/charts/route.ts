import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7' // days
    const days = parseInt(period)

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get daily analytics data
    const dailyAnalytics = await prisma.newsAnalytics.groupBy({
      by: ['date'],
      _sum: {
        views: true,
        likes: true,
        shares: true
      },
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Format data for charts
    const chartData = dailyAnalytics.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      views: item._sum.views || 0,
      likes: item._sum.likes || 0,
      shares: item._sum.shares || 0
    }))

    return NextResponse.json({ chartData })
  } catch (error) {
    console.error('Analytics charts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics charts' },
      { status: 500 }
    )
  }
}