'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'
import { AnalyticsCharts } from '@/components/analytics/analytics-charts'
import { 
  RefreshCw, 
  Download, 
  Calendar,
  Activity,
  Users,
  Clock,
  MapPin,
  Smartphone
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface AnalyticsData {
  overview: {
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
  chartData: {
    date: string
    views: number
    likes: number
    shares: number
  }[]
  topArticles: {
    id: string
    title: string
    views: number
    likes: number
    shares: number
    publishedAt: string | null
    category: {
      name: string
    }
  }[]
  categoryStats: {
    name: string
    articles: number
    totalViews: number
    totalLikes: number
    totalShares: number
    avgViews: number
  }[]
  recentActivity: {
    action: string
    timestamp: string
    device: string | null
    location: string | null
    newsId: string | null
  }[]
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      
      // Fetch all analytics data in parallel
      const [overviewRes, chartsRes, performanceRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch(`/api/analytics/charts?period=${period}`),
        fetch('/api/analytics/performance')
      ])

      if (!overviewRes.ok || !chartsRes.ok || !performanceRes.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const [overviewData, chartsData, performanceData] = await Promise.all([
        overviewRes.json(),
        chartsRes.json(),
        performanceRes.json()
      ])

      setData({
        overview: overviewData.overview,
        chartData: chartsData.chartData,
        topArticles: performanceData.topArticles,
        categoryStats: performanceData.categoryStats,
        recentActivity: performanceData.recentActivity
      })
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const exportData = () => {
    if (!data) return
    
    const exportData = {
      overview: data.overview,
      topArticles: data.topArticles,
      categoryStats: data.categoryStats,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Complete',
      description: 'Analytics data has been downloaded'
    })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h1 className="text-3xl font-bold text-card-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into your news content performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={fetchAnalytics}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <AnalyticsOverview overview={data.overview} topArticles={data.topArticles} />

      {/* Analytics Charts */}
      <AnalyticsCharts chartData={data.chartData} categoryStats={data.categoryStats} />

      {/* Recent Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user interactions with your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.length > 0 ? data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {activity.action === 'view' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'like' && <Activity className="h-4 w-4 text-red-600" />}
                      {activity.action === 'share' && <RefreshCw className="h-4 w-4 text-green-600" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{activity.action}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                        {activity.device && (
                          <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {activity.device}
                          </span>
                        )}
                        {activity.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">User interactions will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Insights
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Average Views per Article</span>
                  <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                    {data.overview.publishedNews > 0 
                      ? Math.round(data.overview.totalViews / data.overview.publishedNews)
                      : 0
                    }
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Engagement Rate</span>
                  <Badge className="bg-green-100 text-green-800">
                    {data.overview.totalViews > 0
                      ? ((data.overview.totalLikes + data.overview.totalShares) / data.overview.totalViews * 100).toFixed(1)
                      : 0
                    }%
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">Most Popular Category</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {data.categoryStats.length > 0 ? data.categoryStats[0].name : 'None'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-900">Publication Rate</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {data.overview.totalNews > 0
                      ? ((data.overview.publishedNews / data.overview.totalNews) * 100).toFixed(0)
                      : 0
                    }%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}