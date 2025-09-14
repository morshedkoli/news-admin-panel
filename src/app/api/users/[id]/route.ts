import { NextRequest, NextResponse } from 'next/server'
import { dbService } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await dbService.getUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response and add mock data
    const { password: _, ...safeUser } = user
    const mockUserData = {
      ...safeUser,
      userSessions: [],
      userActivities: [],
      createdNews: [],
      sentNotifications: [],
      _count: {
        createdNews: 0,
        sentNotifications: 0,
        userSessions: 0,
        userActivities: 0
      }
    }

    return NextResponse.json(mockUserData)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      status,
      permissions,
      emailVerified
    } = body

    // Check if user exists
    const existingUser = await dbService.getUserById(id)

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await dbService.getUserByEmail(email)

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (permissions) updateData.permissions = permissions
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified ? new Date() : null
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Mock update user
    const updatedUser = await dbService.updateUser(id, updateData)

    // Remove password from response and add mock data
    const { password: _pwd, ...safeUser } = updatedUser
    const mockUserData = {
      ...safeUser,
      _count: {
        createdNews: 0,
        sentNotifications: 0,
        userSessions: 0,
        userActivities: 0
      }
    }

    return NextResponse.json(mockUserData)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const existingUser = await dbService.getUserById(id)

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of the last admin
    if (existingUser.role === 'admin') {
      const users = await dbService.getAllUsers()
      const adminCount = users.filter(u => u.role === 'admin').length

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    // Delete user
    await dbService.deleteUser(id)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}