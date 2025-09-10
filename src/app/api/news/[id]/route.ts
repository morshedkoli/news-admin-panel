import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { messaging } from '@/lib/firebase-admin'

// GET /api/news/[id] - Get single news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// PUT /api/news/[id] - Update news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, imageUrl, categoryId, isPublished } = body

    const existingNews = await prisma.news.findUnique({
      where: { id }
    })

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    const wasUnpublished = !existingNews.isPublished
    const willBePublished = isPublished

    const news = await prisma.news.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        categoryId,
        isPublished,
        publishedAt: willBePublished && wasUnpublished ? new Date() : existingNews.publishedAt
      },
      include: {
        category: true
      }
    })

    // Send push notification if newly published
    if (wasUnpublished && willBePublished) {
      await sendPushNotification(news)
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    )
  }
}

// DELETE /api/news/[id] - Delete news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.news.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { error: 'Failed to delete news' },
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