'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/news',
      label: 'News Articles',
      active: pathname.startsWith('/dashboard/news')
    },
    {
      href: '/dashboard/categories',
      label: 'Categories',
      active: pathname.startsWith('/dashboard/categories')
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              News Admin
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.name}
            </span>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}