const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const testEmail = process.env.ADMIN_EMAIL || 'admin@newsapp.com'
    const testPassword = process.env.ADMIN_PASSWORD || 'NewsAdmin123!'
    
    console.log('🔍 Testing login for:', testEmail)
    console.log('🔑 Using password:', testPassword)
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found in database')
    console.log('🔐 Stored password hash:', user.password.substring(0, 20) + '...')
    
    // Test password comparison
    console.log('🔍 Testing password comparison...')
    const isValid = await bcrypt.compare(testPassword, user.password)
    
    if (isValid) {
      console.log('✅ Password is VALID - Login should work!')
    } else {
      console.log('❌ Password is INVALID - This is the problem!')
      
      // Let's test if we can create a new hash and compare
      console.log('🔧 Testing hash creation...')
      const newHash = await bcrypt.hash(testPassword, 12)
      console.log('🆕 New hash:', newHash.substring(0, 20) + '...')
      
      const newTest = await bcrypt.compare(testPassword, newHash)
      console.log('🧪 New hash test:', newTest ? 'VALID' : 'INVALID')
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()