'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { 
  Send, 
  Clock, 
  Image as ImageIcon, 
  Save, 
  Users, 
  Target,
  Calendar,
  X
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface NewsArticle {
  id: string
  title: string
  category: {
    name: string
  }
}

interface NotificationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function NotificationForm({ onSuccess, onCancel }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    type: 'general',
    targetType: 'all',
    targetValue: '',
    newsId: '',
    scheduledAt: ''
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchNewsArticles()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchNewsArticles = async () => {
    try {
      const response = await fetch('/api/news?limit=50')
      if (response.ok) {
        const data = await response.json()
        setNewsArticles(data.news || [])
      }
    } catch (error) {
      console.error('Failed to fetch news articles:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (asDraft = false) => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and message body are required',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        scheduledAt: isScheduled && formData.scheduledAt ? formData.scheduledAt : null
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create notification')
      }

      const notification = await response.json()

      // If not a draft and not scheduled, send immediately
      if (!asDraft && !isScheduled) {
        const sendResponse = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id })
        })

        if (!sendResponse.ok) {
          throw new Error('Failed to send notification')
        }

        toast({
          title: 'Success',
          description: 'Notification sent successfully!'
        })
      } else {
        toast({
          title: 'Success',
          description: asDraft ? 'Notification saved as draft' : 'Notification scheduled successfully'
        })
      }

      // Reset form
      setFormData({
        title: '',
        body: '',
        imageUrl: '',
        type: 'general',
        targetType: 'all',
        targetValue: '',
        newsId: '',
        scheduledAt: ''
      })
      setIsScheduled(false)
      onSuccess?.()
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process notification',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTargetDescription = () => {
    if (formData.targetType === 'all') return 'All subscribers'
    if (formData.targetType === 'category' && formData.targetValue) {
      const category = categories.find(c => c.id === formData.targetValue)
      return `Subscribers interested in ${category?.name || 'selected category'}`
    }
    if (formData.targetType === 'specific') return 'Specific devices'
    return 'Select target audience'
  }

  if (previewMode) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notification Preview</CardTitle>
            <CardDescription>How your notification will appear</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mobile Notification Preview */}
            <div className="bg-gray-100 rounded-lg p-4 max-w-sm mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">News App</p>
                      <p className="text-xs text-gray-500">now</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formData.title || 'Notification Title'}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{formData.body || 'Notification message body will appear here...'}</p>
                    {formData.imageUrl && (
                      <div className="mt-2 rounded overflow-hidden">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-24 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline">{formData.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target:</span>
                <span className="text-right">{getTargetDescription()}</span>
              </div>
              {isScheduled && formData.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="text-right">{new Date(formData.scheduledAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {isScheduled ? 'Schedule' : 'Send Now'}
              </Button>
              <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Create Notification
        </CardTitle>
        <CardDescription>
          Send push notifications to your subscribers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notification title"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/50 characters</p>
          </div>

          <div>
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Enter notification message"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.body.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Notification Type */}
        <div>
          <Label>Notification Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="news">News Update</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Link to News Article */}
        {formData.type === 'news' && (
          <div>
            <Label>Link to Article (Optional)</Label>
            <Select value={formData.newsId} onValueChange={(value) => handleInputChange('newsId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an article" />
              </SelectTrigger>
              <SelectContent>
                {newsArticles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{article.title}</span>
                      <span className="text-xs text-gray-500">{article.category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Target Audience */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Target Audience
          </Label>
          
          <Select value={formData.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Subscribers
                </div>
              </SelectItem>
              <SelectItem value="category">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  By Category Interest
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {formData.targetType === 'category' && (
            <Select value={formData.targetValue} onValueChange={(value) => handleInputChange('targetValue', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <p className="text-sm text-gray-600">{getTargetDescription()}</p>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Notification
            </Label>
            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
          </div>

          {isScheduled && (
            <div>
              <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => setPreviewMode(true)}
            variant="outline"
            className="flex-1"
            disabled={!formData.title.trim() || !formData.body.trim()}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            variant="outline"
            disabled={isSubmitting || !formData.title.trim() || !formData.body.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !formData.title.trim() || !formData.body.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {isScheduled ? 'Schedule' : 'Send Now'}
          </Button>
        </div>

        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}