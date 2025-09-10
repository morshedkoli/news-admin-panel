import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userActivities: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        createdNews: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            createdAt: true,
            views: true,
            likes: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        sentNotifications: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            status: true,
            deliveredCount: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      status,
      permissions,
      emailVerified
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (permissions) updateData.permissions = permissions;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified ? new Date() : null;
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    const changes = Object.keys(updateData).filter(key => key !== 'password');
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: 'USER_UPDATED',
        resource: 'user',
        details: `User profile updated: ${changes.join(', ')}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of the last admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    // Delete user (this will cascade to related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}