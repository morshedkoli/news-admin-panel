import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/users/[id]/sessions - Create user session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { deviceInfo, ipAddress, userAgent } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: id,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        device: deviceInfo?.device || 'Unknown',
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/sessions - Get user sessions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const sessions = await prisma.userSession.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/sessions - Delete all user sessions (logout from all devices)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.userSession.deleteMany({
      where: { userId: id }
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: id,
        action: 'SESSIONS_CLEARED',
        resource: 'session',
        details: 'All user sessions cleared by admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({ message: 'All sessions cleared successfully' });
  } catch (error) {
    console.error('Error clearing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to clear sessions' },
      { status: 500 }
    );
  }
}