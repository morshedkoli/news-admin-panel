import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey, hasPermission } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request);
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(authResult.permissions!, 'notifications:send')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { token, platform, deviceId } = await request.json();

    if (!token || !platform || !deviceId) {
      return NextResponse.json({ 
        error: 'Missing required fields: token, platform, deviceId' 
      }, { status: 400 });
    }

    if (!['android', 'ios'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Check if token already exists
    const existingToken = await prisma.fcmToken.findUnique({
      where: { deviceId }
    });

    let fcmToken;
    if (existingToken) {
      // Update existing token
      fcmToken = await prisma.fcmToken.update({
        where: { deviceId },
        data: {
          token,
          platform,
          isActive: true
        }
      });
    } else {
      // Create new token
      fcmToken = await prisma.fcmToken.create({
        data: {
          token,
          platform,
          deviceId,
          isActive: true
        }
      });
    }

    // Log API request
    await prisma.apiRequest.create({
      data: {
        keyId: authResult.keyId!,
        endpoint: '/api/v1/notifications/register',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      message: 'Device registered successfully',
      tokenId: fcmToken.id
    });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}