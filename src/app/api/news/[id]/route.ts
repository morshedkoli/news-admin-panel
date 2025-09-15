import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db'
import { pushNotificationService } from '@/lib/push-notification-service'

// GET /api/news/[id] - Get single news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const news = await dbService.getNewsById(id)

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    // Populate category information
    const categoryData = await dbService.getCategoryById(news.categoryId)
    const newsWithCategory = {
      ...news,
      category: categoryData || { id: news.categoryId, name: 'Unknown', slug: 'unknown' }
    }

    return NextResponse.json(newsWithCategory)
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

    const existingNews = await dbService.getNewsById(id)

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    const wasUnpublished = !existingNews.isPublished
    const willBePublished = isPublished

    await dbService.updateNews(id, {
      title,
      content,
      imageUrl,
      categoryId,
      isPublished,
      publishedAt: willBePublished && wasUnpublished ? new Date() : existingNews.publishedAt
    })

    const updatedNews = await dbService.getNewsById(id)

    // Send push notification if newly published
    if (wasUnpublished && willBePublished) {
      await pushNotificationService.sendNewsNotification(id, updatedNews!.categoryId)
    }

    return NextResponse.json(updatedNews)
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

    await dbService.deleteNews(id)

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    )
  }
}
