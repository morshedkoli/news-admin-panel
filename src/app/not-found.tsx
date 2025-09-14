import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GoBackButton } from '@/components/ui/go-back-button'
import { Home, Newspaper } from 'lucide-react'

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">News Admin</h2>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-200 select-none mb-4">404</div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-gray-500 text-sm">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/signin" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Go to Sign In</span>
            </Link>
          </Button>
          
          <GoBackButton />
        </div>

        {/* Additional Info */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-sm text-gray-600 mb-3">
            <strong>For administrators:</strong>
          </p>
          <p className="text-sm text-gray-500">
            If you&apos;re trying to access the admin dashboard, please sign in first.
          </p>
        </div>
      </div>
    </div>
  )
}