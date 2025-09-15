'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, Save, Eye, FileText, Image as ImageIcon } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { QuillEditor } from '@/components/ui/quill-editor'

interface Category {
  id: string
  name: string
  slug: string
}

interface NewsFormProps {
  categories: Category[]
  initialData?: {
    id?: string
    title: string
    content: string
    imageUrl?: string
    categoryId: string
    isPublished: boolean
  }
}

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isPublished: z.boolean()
})

type NewsFormData = z.infer<typeof newsSchema>

export function NewsForm({ categories, initialData }: NewsFormProps) {
  console.log('NewsForm received categories:', categories)
  
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null)
  const [content, setContent] = useState(initialData?.content || '')

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      imageUrl: initialData?.imageUrl || '',
      categoryId: initialData?.categoryId || '',
      isPublished: initialData?.isPublished || false
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = form

  const watchedValues = watch()

  // Set initial values for editing
  useEffect(() => {
    if (initialData?.categoryId) {
      setValue('categoryId', initialData.categoryId)
    }
  }, [initialData?.categoryId, setValue])

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    setImageUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setValue('imageUrl', data.url)
      setImagePreview(data.url)
      
      toast({
        title: 'Image uploaded successfully',
        description: 'Your image has been uploaded and is ready to use'
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setImageUploading(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: NewsFormData) => {
    setIsSubmitting(true)
    
    try {
      const url = initialData?.id 
        ? `/api/news/${initialData.id}`
        : '/api/news'
      
      const method = initialData?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          content
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save article')
      }

      const result = await response.json()
      
      toast({
        title: initialData?.id ? 'Article updated' : 'Article created',
        description: data.isPublished 
          ? 'Your article has been published successfully'
          : 'Your article has been saved as draft'
      })

      router.push('/dashboard/news')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save article',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save as draft
  const saveDraft = async () => {
    setValue('isPublished', false)
    const formData = watchedValues
    await onSubmit({ ...formData, content, isPublished: false })
  }

  // Publish article
  const publishArticle = async () => {
    setValue('isPublished', true)
    const formData = watchedValues
    await onSubmit({ ...formData, content, isPublished: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Article Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter article title..."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>
              
              {/* Category Selection */}
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select 
                  onValueChange={(value: string) => setValue('categoryId', value)} 
                  value={watchedValues.categoryId || ''}
                >
                  <SelectTrigger className={errors.categoryId ? 'border-red-500 bg-white' : 'bg-white'}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="bg-white hover:bg-gray-50 text-gray-900">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
                )}
                {categories.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">No categories available. Please create categories first.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
            </CardHeader>
            <CardContent>
              {useMemo(() => (
                <QuillEditor
                  value={content}
                  onChange={(value: string) => {
                    setContent(value)
                    setValue('content', value)
                  }}
                  placeholder="Write your article content here..."
                  className="bg-white"
                />
              ), [content, setValue])}
              {errors.content && (
                <p className="text-sm text-red-500 mt-2">{errors.content.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Publish immediately</span>
                </Label>
                <Switch
                  id="isPublished"
                  checked={watchedValues.isPublished}
                  onCheckedChange={(checked: boolean) => setValue('isPublished', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={saveDraft}
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && !watchedValues.isPublished ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save as Draft
                </Button>
                
                <Button
                  type="button"
                  onClick={publishArticle}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && watchedValues.isPublished ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {initialData?.id ? 'Update & Publish' : 'Publish Article'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Featured Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null)
                      setValue('imageUrl', '')
                    }}
                    className="w-full"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div>
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {imageUploading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Click to upload image</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}