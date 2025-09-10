import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { messaging } from '@/lib/firebase-admin'

// GET /api/news - Retrieve all news articles with filtering/pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const published = searchParams.get('published')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (category) {
      where.categoryId = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (published !== null) {
      where.isPublished = published === 'true'
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.news.count({ where })
    ])

    return NextResponse.json({
      news,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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

    const news = await prisma.news.create({
      data: {
        title,
        content,
        imageUrl,
        categoryId,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null
      },
      include: {
        category: true
      }
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

async function sendPushNotification(news: any) {
  try {
    // Get all FCM tokens
    const tokens = await prisma.fCMToken.findMany({
      select: { token: true }
    })

    if (tokens.length === 0) return

    const message = {
      notification: {
        title: 'New News Article',
        body: news.title
      },
      data: {
        newsId: news.id,
        title: news.title,
        category: news.category.name
      },
      tokens: tokens.map((t: { token: string }) => t.token)
    }

    await messaging.sendEachForMulticast(message)
    console.log('Push notification sent successfully')
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}