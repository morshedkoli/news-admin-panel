'use client'

import { useState, useEffect } from 'react'
import { NewsForm } from '@/components/dashboard/news-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

interface NewsData {
  id: string
  title: string
  content: string
  imageUrl?: string
  categoryId: string
  isPublished: boolean
}

export default function EditNewsPage() {
  const params = useParams()
  const [news, setNews] = useState<NewsData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      const [newsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/news/${params.id}`),
        fetch('/api/categories')
      ])

      if (newsResponse.status === 404) {
        setNotFoundError(true)
        return
      }

      if (newsResponse.ok && categoriesResponse.ok) {
        const [newsData, categoriesData] = await Promise.all([
          newsResponse.json(),
          categoriesResponse.json()
        ])
        setNews(newsData)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (notFoundError || !news) {
    notFound()
  }

  const initialData = {
    id: news.id,
    title: news.title,
    content: news.content,
    imageUrl: news.imageUrl || '',
    categoryId: news.categoryId,
    isPublished: news.isPublished
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/news">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit News Article</h1>
            <p className="text-gray-600 mt-2">
              Update and manage your news content
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <NewsForm categories={categories} initialData={initialData} />
    </div>
  )
}