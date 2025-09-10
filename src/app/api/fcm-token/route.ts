import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/fcm-token - Store/update FCM device token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, deviceId, platform, userId } = body

    if (!token || !deviceId || !platform) {
      return NextResponse.json(
        { error: 'Token, deviceId, and platform are required' },
        { status: 400 }
      )
    }

    // Upsert FCM token (update if exists, create if not)
    const fcmToken = await prisma.fCMToken.upsert({
      where: { deviceId },
      update: {
        token,
        platform,
        userId: userId || null,
        updatedAt: new Date()
      },
      create: {
        token,
        deviceId,
        platform,
        userId: userId || null
      }
    })

    return NextResponse.json(fcmToken, { status: 201 })
  } catch (error) {
    console.error('Error saving FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to save FCM token' },
      { status: 500 }
    )
  }
}

// DELETE /api/fcm-token - Remove FCM token
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId } = body

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    await prisma.fCMToken.delete({
      where: { deviceId }
    })

    return NextResponse.json({ message: 'FCM token removed successfully' })
  } catch (error) {
    console.error('Error removing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to remove FCM token' },
      { status: 500 }
    )
  }
}