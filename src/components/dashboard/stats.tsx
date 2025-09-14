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
      icon: '📰',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Published',
      value: stats.publishedNews,
      icon: '✅',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Drafts',
      value: stats.draftNews,
      icon: '📝',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: '📂',
      gradient: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.title} className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              <p className="text-2xl font-bold text-card-foreground">
                {item.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}