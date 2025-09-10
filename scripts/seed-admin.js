const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🌱 Seeding admin user...')
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@newsapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'NewsAdmin123!'
    const adminName = process.env.ADMIN_NAME || 'News Administrator'
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail)
      return
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
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name:', adminName)
    console.log('')
    console.log('🚨 IMPORTANT: Please change the default password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()