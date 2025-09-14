const admin = require('firebase-admin')
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

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories to Firebase...')
    
    const categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Entertainment', slug: 'entertainment' },
      { name: 'Business', slug: 'business' },
      { name: 'Health', slug: 'health' },
      { name: 'Science', slug: 'science' },
      { name: 'Politics', slug: 'politics' },
      { name: 'Travel', slug: 'travel' }
    ]
    
    const batch = db.batch()
    
    for (const category of categories) {
      // Check if category already exists
      const existing = await db.collection('categories')
        .where('slug', '==', category.slug)
        .limit(1)
        .get()
      
      if (existing.empty) {
        const docRef = db.collection('categories').doc()
        const now = new Date()
        
        batch.set(docRef, {
          ...category,
          id: docRef.id,
          createdAt: now,
          updatedAt: now
        })
        
        console.log(`✅ Will create category: ${category.name}`)
      } else {
        console.log(`ℹ️ Category already exists: ${category.name}`)
      }
    }
    
    await batch.commit()
    console.log('🎉 Categories seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories().then(() => {
  console.log('✨ Seeding finished')
  process.exit(0)
})