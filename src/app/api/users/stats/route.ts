import { NextResponse } from 'next/server'
import { dbService } from '@/lib/db'

// GET /api/users/stats - Get user statistics
export async function GET() {
  try {
    const stats = await dbService.getUserStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}