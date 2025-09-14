import { NextRequest, NextResponse } from 'next/server'

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

    // For now, we'll skip FCM token storage as it's not implemented in dbService
    // In a real app, you would add this method to the database service
    console.log('FCM token received:', { token, deviceId, platform, userId })

    return NextResponse.json({ 
      message: 'FCM token received successfully',
      deviceId 
    }, { status: 201 })
  } catch (error) {
    console.error('Error processing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to process FCM token' },
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

    // For now, we'll skip FCM token removal as it's not implemented in dbService
    console.log('FCM token removal requested for device:', deviceId)

    return NextResponse.json({ message: 'FCM token removal processed' })
  } catch (error) {
    console.error('Error processing FCM token removal:', error)
    return NextResponse.json(
      { error: 'Failed to process FCM token removal' },
      { status: 500 }
    )
  }
}