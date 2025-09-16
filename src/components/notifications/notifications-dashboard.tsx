'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  TrendingUp,
  Smartphone,
  Bell
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  status: string
  targetType: string
  createdAt: string
  sentAt?: string
  scheduledAt?: string
  stats: {
    totalDeliveries: number
    delivered: number
    failed: number
    clicked: number
    deliveryRate: number
    clickRate: number
  }
}

interface TokenStats {
  totalTokens: number
  activeTokens: number
  inactiveTokens: number
  androidTokens: number
  iosTokens: number
}

interface NotificationsDashboardProps {
  onCreateNew?: () => void
}

export function NotificationsDashboard({ onCreateNew }: NotificationsDashboardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchNotifications()
    fetchTokenStats()
  }, [currentPage, statusFilter, typeFilter])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      })

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      })
    }
  }

  const fetchTokenStats = async () => {
    try {
      const response = await fetch('/api/notifications/tokens')
      if (response.ok) {
        const data = await response.json()
        setTokenStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch token stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification sent successfully!'
        })
        fetchNotifications()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Clock, color: 'text-muted-foreground' },
      scheduled: { variant: 'outline' as const, icon: Calendar, color: 'text-primary' },
      sent: { variant: 'default' as const, icon: CheckCircle, color: 'text-emerald-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-destructive' },
      sending: { variant: 'outline' as const, icon: Send, color: 'text-amber-600' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-primary/10 text-primary',
      news: 'bg-emerald-500/10 text-emerald-600',
      promotion: 'bg-violet-500/10 text-violet-600',
      alert: 'bg-rose-500/10 text-rose-600'
    }
    return colors[type as keyof typeof colors] || colors.general
  }

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.body.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {tokenStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold text-foreground">{tokenStats.totalTokens.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                  <p className="text-2xl font-bold text-foreground">{tokenStats.activeTokens.toLocaleString()}</p>
                </div>
                <Smartphone className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Android Users</p>
                  <p className="text-2xl font-bold text-foreground">{tokenStats.androidTokens.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">A</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">iOS Users</p>
                  <p className="text-2xl font-bold text-foreground">{tokenStats.iosTokens.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">i</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your push notifications</CardDescription>
            </div>
            <Button onClick={onCreateNew}>
              <Send className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
              <div key={notification.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(notification.status)}
                      <Badge variant="secondary" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{notification.body}</p>
                    
                    {/* Stats */}
                    {notification.stats.totalDeliveries > 0 && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.stats.totalDeliveries} sent
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          {notification.stats.deliveryRate}% delivered
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-primary" />
                          {notification.stats.clickRate}% clicked
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendNotification(notification.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                  <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                  {notification.sentAt && (
                    <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                  )}
                  {notification.scheduledAt && (
                    <span>Scheduled: {new Date(notification.scheduledAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No notifications match your current filters'
                    : 'Get started by creating your first notification'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
                  <Button onClick={onCreateNew}>
                    <Send className="h-4 w-4 mr-2" />
                    Create First Notification
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}