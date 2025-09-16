'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Edit, Trash2, Plus, Loader2, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  _count: {
    news: number
  }
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setError('')
  }

  const handleSave = async (categoryId: string) => {
    if (!editName.trim()) {
      setError('Category name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim()
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditName('')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update category')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName('')
    setError('')
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(categoryId)

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete category',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
        <p className="text-muted-foreground mb-4">Get started by creating your first category to organize your news articles.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-3 px-6 font-medium text-foreground">Name</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Slug</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Articles</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Created</th>
            <th className="text-left py-3 px-6 font-medium text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-muted/50">
              <td className="py-4 px-6">
                {editingId === category.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="max-w-xs"
                      autoFocus
                    />
                    {error && (
                      <div className="text-red-600 text-xs">{error}</div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                )}
              </td>
              <td className="py-4 px-6">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {category.slug}
                </code>
              </td>
              <td className="py-4 px-6">
                <Badge variant={category._count.news > 0 ? "default" : "secondary"}>
                  {category._count.news} {category._count.news === 1 ? 'article' : 'articles'}
                </Badge>
              </td>
              <td className="py-4 px-6 text-sm text-muted-foreground">
                {formatDate(category.createdAt)}
              </td>
              <td className="py-4 px-6">
                {editingId === category.id ? (
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(category.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deleteLoading === category.id}
                    >
                      {deleteLoading === category.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}