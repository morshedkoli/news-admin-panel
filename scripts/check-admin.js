const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user...')
    
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@newsapp.com' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found!')
      console.log('📧 Email:', adminUser.email)
      console.log('👤 Name:', adminUser.name)
      console.log('🔐 Role:', adminUser.role)
      console.log('📅 Created:', adminUser.createdAt)
    } else {
      console.log('❌ Admin user not found')
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()