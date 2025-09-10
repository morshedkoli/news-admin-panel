interface DashboardStatsProps {
  stats: {
    totalNews: number
    publishedNews: number
    draftNews: number
    totalCategories: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: 'Total Articles',
      value: stats.totalNews,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Published',
      value: stats.publishedNews,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Drafts',
      value: stats.draftNews,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.title} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${item.bgColor} bg-opacity-10`}>
              <div className={`w-6 h-6 ${item.bgColor} rounded`}></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}