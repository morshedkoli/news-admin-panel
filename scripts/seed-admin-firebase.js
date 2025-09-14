const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  })
}

const db = admin.firestore()

async function createAdminUser() {
  try {
    console.log('🌱 Seeding admin user to Firebase...')
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@newsapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'NewsAdmin123!'
    const adminName = process.env.ADMIN_NAME || 'News Administrator'
    
    // Check if admin user already exists
    const existingAdmin = await db.collection('users')
      .where('email', '==', adminEmail)
      .limit(1)
      .get()
    
    if (!existingAdmin.empty) {
      console.log('✅ Admin user already exists:', adminEmail)
      return
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Create admin user
    const docRef = db.collection('users').doc()
    const now = new Date()
    
    const adminUser = {
      id: docRef.id,
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      status: 'active',
      permissions: ['read', 'write', 'delete', 'admin'],
      lastLogin: null,
      loginCount: 0,
      isEmailVerified: true,
      emailVerifiedAt: now,
      passwordChangedAt: null,
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now
    }
    
    await docRef.set(adminUser)
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name:', adminName)
    console.log('')
    console.log('🚨 IMPORTANT: Please change the default password after first login!')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser().then(() => {
  console.log('✨ Admin seeding finished')
  process.exit(0)
})