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

async function createSampleUsers() {
  try {
    console.log('🌱 Seeding sample users to Firebase...')

    const sampleUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'EDITOR',
        status: 'ACTIVE',
        emailVerified: new Date('2024-01-15'),
        permissions: ['create_news', 'edit_news', 'delete_news']
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com', 
        role: 'VIEWER',
        status: 'ACTIVE',
        emailVerified: new Date('2024-02-20'),
        permissions: ['view_news']
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        role: 'EDITOR', 
        status: 'INACTIVE',
        emailVerified: new Date('2024-01-10'),
        permissions: ['create_news', 'edit_news']
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@example.com',
        role: 'VIEWER',
        status: 'PENDING',
        emailVerified: null,
        permissions: ['view_news']
      },
      {
        name: 'Alex Brown',
        email: 'alex.brown@example.com',
        role: 'EDITOR',
        status: 'SUSPENDED',
        emailVerified: new Date('2024-03-01'),
        permissions: ['create_news']
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa.garcia@example.com',
        role: 'VIEWER',
        status: 'ACTIVE',
        emailVerified: new Date('2024-03-15'),
        permissions: ['view_news']
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        role: 'EDITOR',
        status: 'ACTIVE',
        emailVerified: new Date('2024-03-10'),
        permissions: ['create_news', 'edit_news', 'delete_news']
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer.lee@example.com',
        role: 'VIEWER',
        status: 'ACTIVE',
        emailVerified: new Date('2024-03-20'),
        permissions: ['view_news']
      }
    ]

    // Create users with varied creation dates
    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i]
      
      // Check if user already exists
      const existingUser = await db.collection('users')
        .where('email', '==', userData.email)
        .get()

      if (!existingUser.empty) {
        console.log(`✅ User already exists: ${userData.email}`)
        continue
      }

      // Create varied creation dates over the last 2 months
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60))

      const docRef = db.collection('users').doc()
      
      const userDoc = {
        id: docRef.id,
        name: userData.name,
        email: userData.email,
        password: await bcrypt.hash('password123', 10), // Default password
        role: userData.role,
        status: userData.status,
        emailVerified: userData.emailVerified,
        permissions: userData.permissions,
        image: null,
        createdAt: createdAt,
        updatedAt: createdAt,
      }

      await docRef.set(userDoc)
      console.log(`✅ Created user: ${userData.name} (${userData.email})`)
    }

    console.log('✅ Sample users created successfully!')
    console.log('')
    console.log('📊 Users created:')
    console.log('   - 3 Editors (1 active, 1 inactive, 1 suspended)')
    console.log('   - 4 Viewers (3 active, 1 pending)')
    console.log('   - Mixed statuses for analytics demonstration')
    
  } catch (error) {
    console.error('❌ Error creating sample users:', error)
    process.exit(1)
  }
}

createSampleUsers().then(() => {
  console.log('🎉 Sample user seeding completed!')
  process.exit(0)
})