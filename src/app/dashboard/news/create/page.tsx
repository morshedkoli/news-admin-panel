import { prisma } from '@/lib/prisma'
import { NewsForm } from '@/components/dashboard/news-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CreateNewsPage() {
  // Fetch all categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

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
            <h1 className="text-3xl font-bold text-gray-900">Create News Article</h1>
            <p className="text-gray-600 mt-2">
              Create and publish new news content for your audience
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <NewsForm categories={categories} />
    </div>
  )
}