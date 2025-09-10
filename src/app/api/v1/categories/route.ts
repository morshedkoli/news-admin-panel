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

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    // Log API request
    await prisma.apiRequest.create({
      data: {
        keyId: authResult.keyId!,
        endpoint: '/api/v1/categories',
        method: 'GET',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      data: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}