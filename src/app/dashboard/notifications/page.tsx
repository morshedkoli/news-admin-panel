'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationForm } from '@/components/notifications/notification-form'
import { NotificationsDashboard } from '@/components/notifications/notifications-dashboard'
import { NotificationAnalytics } from '@/components/notifications/notification-analytics'
import { NotificationTest } from '@/components/notifications/notification-test'
import { 
  Send, 
  Bell, 
  BarChart3, 
  Plus,
  Smartphone,
  Users,
  TrendingUp
} from 'lucide-react'

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleCreateNew = () => {
    setActiveTab('create')
  }

  const handleFormSuccess = () => {
    setActiveTab('dashboard')
  }

  const handleFormCancel = () => {
    setActiveTab('dashboard')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Push Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and send push notifications to your subscribers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Test
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create New
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="dashboard" className="mt-0">
              <NotificationsDashboard onCreateNew={handleCreateNew} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <NotificationAnalytics />
            </TabsContent>

            <TabsContent value="test" className="mt-0">
              <NotificationTest />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              <NotificationForm 
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80">Total Reach</p>
                <p className="text-2xl font-bold">Real-time push notifications</p>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Instant delivery to all subscribers
                </p>
              </div>
              <Smartphone className="h-12 w-12 text-primary-foreground/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white dark:from-emerald-600 dark:to-emerald-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Engagement</p>
                <p className="text-2xl font-bold">High conversion rates</p>
                <p className="text-emerald-100 text-sm mt-1">
                  Track clicks and user interactions
                </p>
              </div>
              <Users className="h-12 w-12 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white dark:from-violet-600 dark:to-violet-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">Analytics</p>
                <p className="text-2xl font-bold">Detailed insights</p>
                <p className="text-violet-100 text-sm mt-1">
                  Performance metrics and trends
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-violet-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Features</CardTitle>
          <CardDescription>
            Comprehensive push notification management for your news app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Instant & Scheduled</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Send notifications immediately or schedule them for later
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">Targeted Audience</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Send to all users or target specific categories and interests
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-500/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-foreground">Rich Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Track delivery rates, click-through rates, and engagement metrics
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-foreground">Cross Platform</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Support for both Android and iOS devices with Firebase FCM
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500/10 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-rose-600" />
                </div>
                <h3 className="font-semibold text-foreground">Rich Media</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Include images, links to articles, and custom actions
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-foreground">Performance Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor notification performance and optimize engagement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}