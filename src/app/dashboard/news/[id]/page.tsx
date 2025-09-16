'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Calendar, Eye, ThumbsUp, Share2 } from 'lucide-react'
import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  content: string
  imageUrl?: string
  categoryId: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  views: number
  likes: number
  shares: number
  createdBy?: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

export default function NewsViewPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchNews(params.id as string)
    }
  }, [params.id])

  const fetchNews = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('News article not found')
        } else {
          setError('Failed to load news article')
        }
        return
      }

      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('Failed to load news article')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Article Not Found</h1>
              <p className="text-gray-600 mt-2">
                {error || 'The requested article could not be found.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/news">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Article</h1>
              <p className="text-gray-600 mt-2">
                Review and manage this news article
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/news/${news.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Article
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {news.category && (
                    <Badge variant="secondary">
                      {news.category.name}
                    </Badge>
                  )}
                  <Badge variant={news.isPublished ? "default" : "secondary"}>
                    {news.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl">{news.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {news.imageUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="prose prose-gray max-w-none">
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Article Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <span className="font-medium">{news.views || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Likes</span>
                </div>
                <span className="font-medium">{news.likes || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Shares</span>
                </div>
                <span className="font-medium">{news.shares || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Article Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant={news.isPublished ? "default" : "secondary"}>
                    {news.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              {news.category && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Category</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {news.category.name}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 font-medium">Created</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatDate(news.createdAt)}</span>
                </div>
              </div>

              {news.updatedAt !== news.createdAt && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Last Updated</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatDate(news.updatedAt)}</span>
                  </div>
                </div>
              )}

              {news.publishedAt && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Published</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatDate(news.publishedAt)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/news/${news.id}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Article
                </Button>
              </Link>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: news.title,
                      text: stripHtmlTags(news.content).substring(0, 100) + '...',
                      url: window.location.href,
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copied to clipboard!')
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}