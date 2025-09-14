import { NextResponse } from 'next/server'
import { dbService } from '@/lib/db'

interface TokenRegistrationBody {
  token: string
  deviceId: string
  platform: string
  userId?: string
}

export async function GET() {
  try {
    const tokens = await dbService.getAllActiveFCMTokens()
    const totalTokens = tokens.length
    const activeTokens = tokens.filter(t => t.isActive).length
    const androidTokens = tokens.filter(t => t.platform === 'android' && t.isActive).length
    const iosTokens = tokens.filter(t => t.platform === 'ios' && t.isActive).length

    // Get platform distribution
    const platformStats = [
      { platform: 'Android', count: androidTokens, color: '#3DDC84' },
      { platform: 'iOS', count: iosTokens, color: '#007AFF' }
    ]

    // Get recent tokens (last 10)
    const recentTokens = tokens
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(token => ({
        id: token.id,
        platform: token.platform,
        isActive: token.isActive,
        createdAt: token.createdAt,
        deviceId: token.deviceId
      }))

    return NextResponse.json({
      stats: {
        totalTokens,
        activeTokens,
        inactiveTokens: totalTokens - activeTokens,
        androidTokens,
        iosTokens
      },
      platformStats,
      registrationTrend: [], // Simplified for now
      recentTokens
    })
  } catch (error) {
    console.error('Get tokens stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as TokenRegistrationBody
    const { token, deviceId, platform, userId } = body

    if (!token || !deviceId || !platform) {
      return NextResponse.json(
        { error: 'Token, deviceId, and platform are required' },
        { status: 400 }
      )
    }

    // Create or update FCM token
    const fcmToken = await dbService.createOrUpdateFCMToken({
      token,
      deviceId,
      platform,
      userId,
      isActive: true
    })

    return NextResponse.json(fcmToken)
  } catch (error) {
    console.error('Register token error:', error)
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    )
  }
}