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
  X
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
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname.startsWith('/dashboard/settings')
    }
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">News Admin</span>
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
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                item.active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className="inline-block px-2 py-1 mt-1 text-xs bg-accent text-accent-foreground rounded-full">
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
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="bg-background shadow-md border"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex lg:flex-col bg-background border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar with Portal-like behavior */}
      {isMobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[45]"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-[50] w-64 bg-background border-r border-border shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}