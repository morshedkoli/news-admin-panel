import { prisma } from '@/lib/prisma'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentNews } from '@/components/dashboard/recent-news'

export default async function Dashboard() {
  // Get dashboard statistics
  const [
    totalNews,
    publishedNews,
    totalCategories,
    recentNews
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { isPublished: true } }),
    prisma.category.count(),
    prisma.news.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
  ])

  const stats = {
    totalNews,
    publishedNews,
    draftNews: totalNews - publishedNews,
    totalCategories
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your news administration panel
        </p>
      </div>

      <DashboardStats stats={stats} />
      <RecentNews news={recentNews} />
    </div>
  )
}