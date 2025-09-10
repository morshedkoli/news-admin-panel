import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ApiAuthResult {
  valid: boolean;
  error?: string;
  keyId?: string;
  permissions?: string[];
  isUnlimited?: boolean;
}

export async function verifyApiKey(request: NextRequest): Promise<ApiAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });

    if (!keyRecord) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (keyRecord.status !== 'active') {
      return { valid: false, error: 'API key is inactive' };
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Check if this is an unlimited internal app key
    const isUnlimited = keyRecord.rateLimit === -1 || keyRecord.permissions.includes('internal:unlimited');

    // Rate limiting check (skip for unlimited keys)
    if (!isUnlimited) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const requestCount = await prisma.apiRequest.count({
        where: {
          keyId: keyRecord.id,
          timestamp: {
            gte: oneHourAgo
          }
        }
      });

      if (requestCount >= keyRecord.rateLimit) {
        return { valid: false, error: 'Rate limit exceeded' };
      }
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    });

    return {
      valid: true,
      keyId: keyRecord.id,
      permissions: keyRecord.permissions,
      isUnlimited
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return { valid: false, error: 'Internal server error' };
  }
}

export function hasPermission(permissions: string[], required: string): boolean {
  // Internal unlimited access bypasses all permission checks
  if (permissions.includes('internal:unlimited')) {
    return true;
  }
  
  return permissions.includes(required);
}