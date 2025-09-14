import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/users/[id]/activities - Get user activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || '';

    // For now, return mock data since UserActivity model might not be fully implemented
    // In a real implementation, you would query the userActivity table
    const mockActivities = [
      {
        id: '1',
        userId: id,
        action: 'login',
        resource: 'authentication',
        details: 'User logged in successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        ipAddress: '192.168.1.1'
      },
      {
        id: '2',
        userId: id,
        action: 'profile_update',
        resource: 'user_profile',
        details: 'User updated their profile information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        ipAddress: '192.168.1.1'
      },
      {
        id: '3',
        userId: id,
        action: 'password_change',
        resource: 'security',
        details: 'User changed their password',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        ipAddress: '192.168.1.1'
      }
    ];

    // Filter by action if provided
    let filteredActivities = mockActivities;
    if (action) {
      filteredActivities = mockActivities.filter(activity => activity.action === action);
    }

    // Apply pagination
    const total = filteredActivities.length;
    const skip = (page - 1) * limit;
    const activities = filteredActivities.slice(skip, skip + limit);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/activities - Log user activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, description } = body;

    // Validate required fields
    if (!action || !description) {
      return NextResponse.json(
        { error: 'Action and description are required' },
        { status: 400 }
      );
    }

    // For now, return a mock response since UserActivity model might not be fully implemented
    // In a real implementation, you would create the activity in the database
    const activity = {
      id: Date.now().toString(),
      userId: id,
      action,
      resource: 'manual',
      details: description,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    };

    console.log('Activity logged:', activity);

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}