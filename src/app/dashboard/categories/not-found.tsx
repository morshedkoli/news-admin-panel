import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GoBackButton } from '@/components/ui/go-back-button'
import { Home, FolderOpen } from 'lucide-react'

export default function CategoryNotFound() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Category Not Found</h1>
        <p className="text-gray-600 mt-2">
          The requested category could not be found
        </p>
      </div>

      {/* 404 Content */}
      <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="w-12 h-12 text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Category Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The category you&apos;re looking for might have been deleted, moved, 
          or the URL might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard/categories" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>All Categories</span>
            </Link>
          </Button>
          
          <GoBackButton />
        </div>
      </div>
    </div>
  )
}