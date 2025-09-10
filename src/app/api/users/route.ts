import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/users - Get all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          userActivities: {
            orderBy: { timestamp: 'desc' },
            take: 5
          },
          _count: {
            select: {
              createdNews: true,
              sentNotifications: true,
              userSessions: true,
              userActivities: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Remove password from response
    const safeUsers = users.map((user: any) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = 'EDITOR',
      status = 'ACTIVE',
      permissions = []
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        permissions,
        emailVerified: new Date() // Auto-verify for admin created users
      },
      include: {
        _count: {
          select: {
            createdNews: true,
            sentNotifications: true,
            sessions: true,
            activities: true
          }
        }
      }
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        resource: 'user',
        details: 'User account created by admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}