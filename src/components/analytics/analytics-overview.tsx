'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Heart, 
  Share2, 
  FileText, 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  Clock
} from 'lucide-react'

interface OverviewData {
  totalNews: number
  publishedNews: number
  draftNews: number
  totalCategories: number
  totalViews: number
  totalLikes: number
  totalShares: number
  todayViews: number
  yesterdayViews: number
  thisWeekViews: number
  thisMonthViews: number
  viewsGrowth: number
}

interface TopArticle {
  id: string
  title: string
  views: number
  likes: number
  shares: number
  publishedAt: string | null
  category: {
    name: string
  }
}

interface AnalyticsOverviewProps {
  overview: OverviewData
  topArticles: TopArticle[]
}

export function AnalyticsOverview({ overview, topArticles }: AnalyticsOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <TrendingUp className="h-4 w-4 text-gray-400" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.totalViews)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(overview.viewsGrowth)}
              <span className={`ml-1 ${getGrowthColor(overview.viewsGrowth)}`}>
                {overview.viewsGrowth > 0 ? '+' : ''}{overview.viewsGrowth.toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalNews}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Globe className="h-3 w-3 mr-1" />
              <span className="text-green-600">{overview.publishedNews} published</span>
              <span className="mx-1">•</span>
              <span className="text-yellow-600">{overview.draftNews} drafts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.totalLikes)}</div>
            <div className="text-xs text-muted-foreground">
              Engagement rate: {overview.totalViews > 0 ? ((overview.totalLikes / overview.totalViews) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.totalShares)}</div>
            <div className="text-xs text-muted-foreground">
              Share rate: {overview.totalViews > 0 ? ((overview.totalShares / overview.totalViews) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Views</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.todayViews)}</div>
            <div className="text-xs text-muted-foreground">
              Yesterday: {formatNumber(overview.yesterdayViews)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.thisWeekViews)}</div>
            <div className="text-xs text-muted-foreground">
              Last 7 days views
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.thisMonthViews)}</div>
            <div className="text-xs text-muted-foreground">
              Last 30 days views
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>Articles with the highest views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topArticles.length > 0 ? topArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <Badge variant="secondary" className="text-xs">{article.category.name}</Badge>
                  </div>
                  <h4 className="font-medium mt-1 line-clamp-1">{article.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(article.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(article.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {formatNumber(article.shares)}
                    </span>
                    {article.publishedAt && (
                      <span className="text-xs">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No articles published yet</p>
                <p className="text-sm">Start creating content to see analytics data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}