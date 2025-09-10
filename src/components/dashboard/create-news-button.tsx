'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function CreateNewsButton() {
  return (
    <Button asChild>
      <Link href="/dashboard/news/create" className="flex items-center space-x-2">
        <Plus className="w-4 h-4" />
        <span>Create Article</span>
      </Link>
    </Button>
  )
}