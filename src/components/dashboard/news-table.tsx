'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from 'lucide-react'
import { useState } from 'react'

interface News {
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

interface NewsTableProps {
  news: News[]
}

export function NewsTable({ news }: NewsTableProps) {
  const [selectedNews, setSelectedNews] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No articles yet</h3>
        <p className="text-muted-foreground mb-4">Get started by creating your first news article.</p>
        <Button asChild>
          <Link href="/dashboard/news/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-3 px-6 font-medium text-foreground">Title</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Category</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Status</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Created</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {news.map((article) => (
            <tr key={article.id} className="hover:bg-muted/50">
              <td className="py-4 px-6">
                <div className="flex items-start space-x-3">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncateContent(article.content.replace(/<[^>]*>/g, ''))}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <Badge variant="secondary">
                  {article.category?.name || 'Unknown Category'}
                </Badge>
              </td>
              <td className="py-4 px-6">
                <Badge variant={article.isPublished ? "default" : "secondary"}>
                  {article.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </td>
              <td className="py-4 px-6 text-sm text-muted-foreground">
                {formatDate(article.createdAt)}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/news/${article.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/news/${article.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}