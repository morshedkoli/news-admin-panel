'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316']

interface ChartData {
  date: string
  views: number
  likes: number
  shares: number
}

interface CategoryData {
  name: string
  articles: number
  totalViews: number
  totalLikes: number
  totalShares: number
  avgViews: number
}

interface AnalyticsChartsProps {
  chartData: ChartData[]
  categoryStats: CategoryData[]
}

export function AnalyticsCharts({ chartData, categoryStats }: AnalyticsChartsProps) {
  // Prepare pie chart data for categories
  const categoryPieData = categoryStats.slice(0, 6).map((cat, index) => ({
    name: cat.name,
    value: cat.totalViews,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Views Trend Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Views Trend</CardTitle>
          <CardDescription>Daily views, likes, and shares over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="views"
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stackId="1"
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.6}
                  name="likes"
                />
                <Area 
                  type="monotone" 
                  dataKey="shares" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="shares"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Total views by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={categoryStats.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Total Views']}
                />
                <Bar dataKey="totalViews" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Views distribution across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Views']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Likes and shares trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444' }}
                  name="likes"
                />
                <Line 
                  type="monotone" 
                  dataKey="shares" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                  name="shares"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}