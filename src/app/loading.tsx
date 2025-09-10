import { Newspaper } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo with animation */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">News Admin</h2>
        </div>

        {/* Loading Animation */}
        <div className="mb-4">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        <p className="text-gray-600 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  )
}