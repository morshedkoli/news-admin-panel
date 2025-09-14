'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, Newspaper, AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">News Admin</h2>
            </div>

            {/* Error Illustration */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Application Error
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                            We&apos;re sorry, but something went wrong. This error has been reported to
              </p>
              <p className="text-gray-500 text-sm">
                Our team has been notified and is working to resolve this issue.
              </p>
            </div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                <p className="text-xs text-red-600 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-500 mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button onClick={reset} className="bg-red-600 hover:bg-red-700 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/auth/signin" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Go to Sign In</span>
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <p className="text-sm text-gray-600">
                If you continue to experience issues, please contact support.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}