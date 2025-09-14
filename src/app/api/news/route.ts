import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db'
import { messaging } from '@/lib/firebase-admin'

// GET /api/news - Retrieve all news articles with filtering/pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const result = await dbService.getAllNews({ page, limit, category: category || undefined, search: search || undefined })

    // Populate category information for each news item
    const newsWithCategories = await Promise.all(
      result.news.map(async (newsItem) => {
        const categoryData = await dbService.getCategoryById(newsItem.categoryId)
        return {
          ...newsItem,
          category: categoryData || { id: newsItem.categoryId, name: 'Unknown', slug: 'unknown' }
        }
      })
    )

    return NextResponse.json({
      ...result,
      news: newsWithCategories
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// POST /api/news - Create a new news article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, imageUrl, categoryId, isPublished } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const news = await dbService.createNews({
      title,
      content,
      imageUrl,
      categoryId,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : undefined,
      views: 0,
      likes: 0,
      shares: 0
    })

    // Send push notification if published
    if (isPublished) {
      await sendPushNotification(news)
    }

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    )
  }
}

interface NotificationNews {
  id: string
  title: string
  category?: {
    name: string
  }
}

async function sendPushNotification(news: NotificationNews) {
  try {
    // Get all FCM tokens
    const tokens = await dbService.getAllActiveFCMTokens()

    if (tokens.length === 0) return

    const message = {
      notification: {
        title: 'New News Article',
        body: news.title
      },
      data: {
        newsId: news.id,
        title: news.title,
        category: news.category?.name || 'General'
      },
      tokens: tokens.map((t: { token: string }) => t.token)
    }

    await messaging.sendEachForMulticast(message)
    console.log('Push notification sent successfully')
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}