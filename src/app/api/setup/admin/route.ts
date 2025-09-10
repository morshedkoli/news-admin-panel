import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@newsapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'NewsAdmin123!'
    const adminName = process.env.ADMIN_NAME || 'News Administrator'
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
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
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN'
      }
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