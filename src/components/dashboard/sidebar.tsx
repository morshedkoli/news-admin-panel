'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Newspaper, 
  FolderOpen, 
  Settings, 
  Bell,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Code
} from 'lucide-react'
import { useState } from 'react'

interface DashboardSidebarProps {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/news',
      label: 'News Articles',
      icon: Newspaper,
      active: pathname.startsWith('/dashboard/news')
    },
    {
      href: '/dashboard/categories',
      label: 'Categories',
      icon: FolderOpen,
      active: pathname.startsWith('/dashboard/categories')
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: pathname.startsWith('/dashboard/analytics')
    },
    {
      href: '/dashboard/notifications',
      label: 'Notifications',
      icon: Bell,
      active: pathname.startsWith('/dashboard/notifications')
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
      active: pathname.startsWith('/dashboard/users')
    },
    {
      href: '/dashboard/api',
      label: 'API Management',
      icon: Code,
      active: pathname.startsWith('/dashboard/api')
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname.startsWith('/dashboard/settings')
    }
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">News Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                item.active
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                item.active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="inline-block px-2 py-1 mt-1 text-xs bg-green-100 text-green-800 rounded-full">
              {user.role}
            </span>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className={cn(
            'w-full flex items-center space-x-2',
            isCollapsed && 'px-2'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="bg-white shadow-md"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}