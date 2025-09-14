import { NextResponse } from 'next/server'
import { dbService } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@newsapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'NewsAdmin123!'
    const adminName = process.env.ADMIN_NAME || 'News Administrator'
    
    // Check if admin user already exists
    const existingAdmin = await dbService.getUserByEmail(adminEmail)
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        email: adminEmail
      })
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Create admin user
    await dbService.createUser({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      status: 'active',
      permissions: ['*'],
      loginCount: 0,
      isEmailVerified: true,
      twoFactorEnabled: false
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        name: adminName
      },
      warning: 'Please change the default password after first login!'
    })
    
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}