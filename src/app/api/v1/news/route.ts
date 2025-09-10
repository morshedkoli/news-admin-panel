import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, hasPermission } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublished: true
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.news.count({ where })
    ]);

    // Log API request
    await prisma.apiRequest.create({
      data: {
        keyId: authResult.keyId,
        endpoint: '/api/v1/news',
        method: 'GET',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: news.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content.substring(0, 200) + '...', // Truncate for list view
        imageUrl: article.imageUrl,
        category: article.category,
        publishedAt: article.publishedAt,
        views: article.views,
        likes: article.likes
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}