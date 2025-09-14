import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GoBackButton } from '@/components/ui/go-back-button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <p className="text-gray-500 text-sm">
            The page may have been moved, deleted, or you entered the URL incorrectly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          </Button>
          
          <GoBackButton />
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Try these common pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/news" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              News Articles
            </Link>
            <Link 
              href="/dashboard/categories" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Categories
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}