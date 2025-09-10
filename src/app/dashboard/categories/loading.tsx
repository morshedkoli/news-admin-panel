export default function CategoriesLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="text-left py-3 px-6">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-12"></div>
                </th>
                <th className="text-left py-3 px-6">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="text-left py-3 px-6">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="text-left py-3 px-6">
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="animate-pulse w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}