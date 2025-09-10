const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...')
    
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
    
    for (const category of categories) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug }
      })
      
      if (!existing) {
        await prisma.category.create({
          data: category
        })
        console.log(`✅ Created category: ${category.name}`)
      } else {
        console.log(`ℹ️ Category already exists: ${category.name}`)
      }
    }
    
    console.log('🎉 Categories seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()