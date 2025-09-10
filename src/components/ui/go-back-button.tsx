'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function GoBackButton() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <Button variant="outline" onClick={handleGoBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Go Back
    </Button>
  )
}