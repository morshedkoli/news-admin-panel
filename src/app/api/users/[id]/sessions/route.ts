import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

// POST /api/users/[id]/sessions - Create user session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deviceInfo, ipAddress, userAgent } = body;

    // Check if user exists
    const user = await dbService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create session (mock implementation)
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId: id,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      device: deviceInfo?.device || 'Unknown',
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock sessions data
    const sessions = [
      {
        id: `session_1_${id}`,
        userId: id,
        sessionId: `session_${Date.now()}_active`,
        device: 'Desktop',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ].slice(0, limit);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mock session deletion - in real implementation would delete from database
    console.log(`Deleting all sessions for user ${id}`);

    // Log activity (commented out until UserActivity model is properly implemented)
    // await prisma.userActivity.create({
    //   data: {
    //     userId: id,
    //     action: 'SESSIONS_CLEARED',
    //     resource: 'session',
    //     details: 'All user sessions cleared by admin',
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    //   }
    // });

    return NextResponse.json({ message: 'All sessions cleared successfully' });
  } catch (error) {
    console.error('Error clearing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to clear sessions' },
      { status: 500 }
    );
  }
}