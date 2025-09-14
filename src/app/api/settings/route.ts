import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { dbService } from '@/lib/db'

// GET /api/settings - Get application settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { role: string } }
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await dbService.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST /api/settings - Save application settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { role: string } }
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await request.json()

    // Validate required fields
    if (!settings.general?.siteName) {
      return NextResponse.json(
        { error: 'Site name is required' },
        { status: 400 }
      )
    }

    if (!settings.general?.adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.general.adminEmail)) {
      return NextResponse.json(
        { error: 'Invalid admin email format' },
        { status: 400 }
      )
    }

    // Validate numeric values
    if (settings.general?.newsPerPage && (settings.general.newsPerPage < 1 || settings.general.newsPerPage > 100)) {
      return NextResponse.json(
        { error: 'News per page must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (settings.security?.sessionTimeout && (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480)) {
      return NextResponse.json(
        { error: 'Session timeout must be between 5 and 480 minutes' },
        { status: 400 }
      )
    }

    if (settings.security?.passwordMinLength && (settings.security.passwordMinLength < 4 || settings.security.passwordMinLength > 50)) {
      return NextResponse.json(
        { error: 'Password minimum length must be between 4 and 50 characters' },
        { status: 400 }
      )
    }

    // Save settings
    await dbService.saveSettings(settings)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}