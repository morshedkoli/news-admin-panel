'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { 
  Send, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Users,
  Smartphone,
  Bell
} from 'lucide-react'

interface TestResult {
  success: boolean
  notificationId?: string
  stats?: {
    totalTokens: number
    successful: number
    failed: number
  }
  error?: string
}

export function NotificationTest() {
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null)

  const handleTestNotification = async () => {
    setIsTestingNotification(true)
    setLastTestResult(null)

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      setLastTestResult(result)

      if (result.success) {
        toast({
          title: 'Test Successful! 🎉',
          description: `Test notification sent to ${result.stats?.totalTokens || 0} devices`
        })
      } else {
        toast({
          title: 'Test Failed',
          description: result.error || 'Failed to send test notification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      const errorResult = { success: false, error: 'Network error occurred' }
      setLastTestResult(errorResult)
      toast({
        title: 'Test Failed',
        description: 'Network error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsTestingNotification(false)
    }
  }

  const getStatusBadge = (success: boolean) => {
    if (success) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          Success
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Push Notification Testing
        </CardTitle>
        <CardDescription>
          Test your push notification configuration and delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Button
            onClick={handleTestNotification}
            disabled={isTestingNotification}
            className="flex items-center gap-2"
          >
            {isTestingNotification ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending Test...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Test Notification
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-600">
            This will send a test notification to all registered devices
          </div>
        </div>

        {/* Test Results */}
        {lastTestResult && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Last Test Result</h3>
              {getStatusBadge(lastTestResult.success)}
            </div>

            {lastTestResult.success && lastTestResult.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Devices</p>
                    <p className="text-lg font-bold">{lastTestResult.stats.totalTokens}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Successful</p>
                    <p className="text-lg font-bold text-green-600">{lastTestResult.stats.successful}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Failed</p>
                    <p className="text-lg font-bold text-red-600">{lastTestResult.stats.failed}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600 text-sm">
                <p className="font-medium">Error:</p>
                <p>{lastTestResult.error}</p>
              </div>
            )}

            {lastTestResult.notificationId && (
              <div className="mt-3 text-xs text-gray-500">
                Notification ID: {lastTestResult.notificationId}
              </div>
            )}
          </div>
        )}

        {/* Configuration Status */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Configuration Status
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Firebase Admin SDK</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Configured
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Push Notification Service</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Auto-notification on News Publish</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Enabled
              </Badge>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• When you publish a new news article, users automatically receive push notifications</li>
            <li>• When you update a draft article to published, notifications are sent</li>
            <li>• Notifications include the article title and category</li>
            <li>• Users can tap the notification to open the article in the app</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
