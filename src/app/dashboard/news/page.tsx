'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NewsTable } from '@/components/dashboard/news-table'
import { CreateNewsButton } from '@/components/dashboard/create-news-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NewsWithCategory {
  id: string
  title: string
  content: string
  imageUrl: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  category?: {
    id: string
    name: string
    slug: string
  }
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/news/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNews(news.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting news:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // Get published and draft counts
  const publishedCount = news.filter(item => item.isPublished).length
  const draftCount = news.filter(item => !item.isPublished).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News Articles</h1>
            <p className="text-gray-600 mt-2">
              Manage your news content and publications
            </p>
          </div>
          <CreateNewsButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{news.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <NewsTable news={news} />
      </div>
    </div>
  )
}