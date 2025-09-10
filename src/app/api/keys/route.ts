import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            requests: true
          }
        }
      }
    });

    // Transform the data to match our interface
    const transformedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      key: key.key,
      permissions: key.permissions,
      status: key.status,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      requestCount: key._count.requests,
      rateLimit: key.rateLimit
    }));

    return NextResponse.json({ keys: transformedKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, permissions, expiresAt, rateLimit } = await request.json();

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    const apiKey = generateApiKey();

    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        permissions,
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        rateLimit: rateLimit || 1000,
        createdBy: session.user?.email || 'system'
      }
    });

    return NextResponse.json({ 
      message: 'API key created successfully',
      key: {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
        permissions: newKey.permissions,
        status: newKey.status,
        createdAt: newKey.createdAt,
        expiresAt: newKey.expiresAt,
        rateLimit: newKey.rateLimit
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}