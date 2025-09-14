import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RecentNewsProps {
  news: Array<{
    id: string
    title: string
    isPublished: boolean
    createdAt: Date
    category: {
      name: string
    }
  }>
}

export function RecentNews({ news }: RecentNewsProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-card-foreground">Recent Articles</h2>
          <Link href="/dashboard/news">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-6">
        {news.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No articles yet. 
            <Link href="/dashboard/news/create" className="text-primary hover:underline ml-1">
              Create your first article
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <div key={article.id} className="flex justify-between items-center py-2">
                <div>
                  <h3 className="font-medium text-card-foreground">{article.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-muted-foreground">{article.category.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.isPublished 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/news/${article.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}