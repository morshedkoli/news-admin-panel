'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationForm } from '@/components/notifications/notification-form'
import { NotificationsDashboard } from '@/components/notifications/notifications-dashboard'
import { NotificationAnalytics } from '@/components/notifications/notification-analytics'
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              Push Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and send push notifications to your subscribers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab('create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
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
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Reach</p>
                <p className="text-2xl font-bold">Real-time push notifications</p>
                <p className="text-blue-100 text-sm mt-1">
                  Instant delivery to all subscribers
                </p>
              </div>
              <Smartphone className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Engagement</p>
                <p className="text-2xl font-bold">High conversion rates</p>
                <p className="text-green-100 text-sm mt-1">
                  Track clicks and user interactions
                </p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Analytics</p>
                <p className="text-2xl font-bold">Detailed insights</p>
                <p className="text-purple-100 text-sm mt-1">
                  Performance metrics and trends
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200" />
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
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold">Instant & Scheduled</h3>
              </div>
              <p className="text-sm text-gray-600">
                Send notifications immediately or schedule them for later
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold">Targeted Audience</h3>
              </div>
              <p className="text-sm text-gray-600">
                Send to all users or target specific categories and interests
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-semibold">Rich Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">
                Track delivery rates, click-through rates, and engagement metrics
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold">Cross Platform</h3>
              </div>
              <p className="text-sm text-gray-600">
                Support for both Android and iOS devices with Firebase FCM
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="font-semibold">Rich Media</h3>
              </div>
              <p className="text-sm text-gray-600">
                Include images, links to articles, and custom actions
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold">Performance Tracking</h3>
              </div>
              <p className="text-sm text-gray-600">
                Monitor notification performance and optimize engagement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}