import { prisma } from '@/lib/prisma'
import { NewsForm } from '@/components/dashboard/news-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditNewsPageProps {
  params: {
    id: string
  }
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  // Fetch the news article
  const news = await prisma.news.findUnique({
    where: {
      id: params.id
    },
    include: {
      category: true
    }
  })

  if (!news) {
    notFound()
  }

  // Fetch all categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

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