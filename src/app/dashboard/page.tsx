import { dbService } from '@/lib/db'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentNews } from '@/components/dashboard/recent-news'

export default async function Dashboard() {
  // Get dashboard statistics using Firebase
  const [
    allNewsResult,
    allCategories,
    recentNewsResult
  ] = await Promise.all([
    dbService.getAllNews({ page: 1, limit: 10000 }), // Get all news for counting
    dbService.getAllCategories(),
    dbService.getAllNews({ page: 1, limit: 5 })
  ])

  const totalNews = allNewsResult.total;
  const publishedNews = allNewsResult.news.filter((news) => news.isPublished).length;
  const totalCategories = allCategories.length;

  // Combine news with category data
  const recentNewsWithCategories = recentNewsResult.news.map((news) => {
    const category = allCategories.find((cat) => cat.id === news.categoryId);
    return {
      id: news.id,
      title: news.title,
      isPublished: news.isPublished,
      createdAt: news.createdAt,
      category: {
        name: category?.name || 'Uncategorized'
      }
    };
  });

  const stats = {
    totalNews,
    publishedNews,
    draftNews: totalNews - publishedNews,
    totalCategories
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h1 className="text-3xl font-bold text-card-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your news administration panel
        </p>
      </div>

      <DashboardStats stats={stats} />
      <RecentNews news={recentNewsWithCategories} />
    </div>
  )
}