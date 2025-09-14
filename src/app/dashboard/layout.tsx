import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

interface Session {
  user: SessionUser
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions) as Session | null

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar user={session.user} />
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}