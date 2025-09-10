import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/stats - Get user statistics
export async function GET() {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingUsers,
      adminUsers,
      editorUsers,
      viewerUsers,
      recentUsers,
      usersByRole,
      usersByStatus,
      dailyRegistrations
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Inactive users
      prisma.user.count({
        where: { status: 'INACTIVE' }
      }),
      
      // Pending users
      prisma.user.count({
        where: { status: 'PENDING' }
      }),
      
      // Admin users
      prisma.user.count({
        where: { role: 'ADMIN' }
      }),
      
      // Editor users
      prisma.user.count({
        where: { role: 'EDITOR' }
      }),
      
      // Viewer users
      prisma.user.count({
        where: { role: 'VIEWER' }
      }),
      
      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      
      // Users by status
      prisma.user.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Daily registrations (last 30 days)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          id: true
        }
      })
    ]);

    const stats = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        pending: pendingUsers,
        recent: recentUsers
      },
      roles: {
        admin: adminUsers,
        editor: editorUsers,
        viewer: viewerUsers,
        breakdown: usersByRole.map((item: any) => ({
          role: item.role,
          count: item._count.id
        }))
      },
      status: {
        breakdown: usersByStatus.map((item: any) => ({
          status: item.status,
          count: item._count.id
        }))
      },
      trends: {
        dailyRegistrations: dailyRegistrations.map((item: any) => ({
          date: item.createdAt,
          count: item._count.id
        })) || []
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}