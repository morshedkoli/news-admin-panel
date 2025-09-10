import { NextResponse } from 'next/server'
import { AnalyticsTracker } from '@/lib/analytics-tracker'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newsId, action, sessionId, device, location, duration } = body

    if (!newsId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: newsId and action' },
        { status: 400 }
      )
    }

    if (!['view', 'like', 'share'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be view, like, or share' },
        { status: 400 }
      )
    }

    const result = await AnalyticsTracker.trackEvent({
      newsId,
      action,
      sessionId,
      device,
      location,
      duration
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to track analytics event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Event tracked successfully' })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!newsId) {
      return NextResponse.json(
        { error: 'Missing newsId parameter' },
        { status: 400 }
      )
    }

    const result = await AnalyticsTracker.getArticleAnalytics(newsId, days)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch article analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Analytics get error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}