import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, hasPermission } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(authResult.permissions!, 'news:read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    const article = await prisma.news.findUnique({
      where: { 
        id,
        isPublished: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Log API request
    if (authResult.keyId) {
      await prisma.apiRequest.create({
        data: {
          keyId: authResult.keyId,
          endpoint: `/api/v1/news/${id}`,
          method: 'GET',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    }

    return NextResponse.json({
      data: {
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        category: article.category,
        publishedAt: article.publishedAt,
        views: article.views + 1, // Include the incremented view
        likes: article.likes,
        shares: article.shares
      }
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}