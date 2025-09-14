"use client"

import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const toast = ({ title, description, variant }: ToastProps) => {
  // Simple alert implementation for now
  const message = title + (description ? '\n' + description : '')
  if (variant === 'destructive') {
    console.error(message)
    alert('Error: ' + message)
  } else {
    console.log(message)
    alert('Success: ' + message)
  }
}

export const useToast = () => {
  return { toast }
}