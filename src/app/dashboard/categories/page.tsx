'use client'

import { useState, useEffect } from 'react'
import { CategoriesTable } from '@/components/dashboard/categories-table'
import { CreateCategoryButton } from '@/components/dashboard/create-category-button'

interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  _count: {
    news: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Add _count property for compatibility with the table component
        const categoriesWithCount = data.map((cat: { id: string; name: string; description?: string }) => ({
          ...cat,
          _count: { news: 0 } // Simplified for now - could be enhanced to get actual counts
        }))
        setCategories(categoriesWithCount)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // Calculate stats
  const totalCategories = categories.length
  const categoriesWithNews = 0 // Simplified for now
  const emptyCategories = totalCategories - categoriesWithNews

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">Organize your news content with categories</p>
          </div>
          <CreateCategoryButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold text-card-foreground">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">With Articles</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{categoriesWithNews}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Empty Categories</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{emptyCategories}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-lg shadow-sm border">
        <CategoriesTable categories={categories} />
      </div>
    </div>
  )
}