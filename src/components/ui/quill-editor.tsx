'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { Loader2 } from 'lucide-react'

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Declare Quill type
declare global {
  interface Window {
    Quill: any
  }
}

export function QuillEditor({ value, onChange, placeholder, className }: QuillEditorProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const quillInstance = useRef<any>(null)
  const editorId = useId()
  const isInitializing = useRef(false)

  useEffect(() => {
    const loadQuill = async () => {
      try {
        // Check if Quill CSS is already loaded
        if (!document.querySelector('link[href*="quill.snow.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css'
          document.head.appendChild(link)
        }

        // Check if Quill JS is already loaded
        if (!window.Quill) {
          const script = document.createElement('script')
          script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js'
          script.onload = () => {
            setIsLoaded(true)
          }
          script.onerror = () => {
            setError('Failed to load Quill editor')
          }
          document.head.appendChild(script)
        } else {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load Quill:', error)
        setError('Failed to load editor')
      }
    }

    // Only load if not already loaded or loading
    if (!isLoaded && !window.Quill) {
      loadQuill()
    } else if (window.Quill && !isLoaded) {
      setIsLoaded(true)
    }
  }, []) // Remove dependencies to prevent re-loading

  useEffect(() => {
    if (isLoaded && window.Quill && editorRef.current && !quillInstance.current && !isInitializing.current) {
      isInitializing.current = true
      
      try {
        // Clear any existing content and ensure clean slate
        const editorElement = editorRef.current
        
        // Remove any existing Quill instances in this element
        const existingToolbar = editorElement.querySelector('.ql-toolbar')
        const existingContainer = editorElement.querySelector('.ql-container')
        if (existingToolbar) existingToolbar.remove()
        if (existingContainer) existingContainer.remove()
        
        // Clear content
        editorElement.innerHTML = ''
        
        const toolbarOptions = [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'blockquote', 'code-block'],
          ['clean']
        ]

        // Create new Quill instance
        quillInstance.current = new window.Quill(editorElement, {
          theme: 'snow',
          placeholder: placeholder || 'Write your content here...',
          modules: {
            toolbar: toolbarOptions
          }
        })

        // Set initial content
        if (value) {
          quillInstance.current.root.innerHTML = value
        }

        // Handle content changes with debouncing to prevent excessive updates
        let timeout: NodeJS.Timeout
        quillInstance.current.on('text-change', () => {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            if (quillInstance.current) {
              const content = quillInstance.current.root.innerHTML
              onChange(content)
            }
          }, 300)
        })
        
        isInitializing.current = false
      } catch (error) {
        console.error('Failed to initialize Quill:', error)
        setError('Failed to initialize editor')
        isInitializing.current = false
      }
    }

    return () => {
      if (quillInstance.current) {
        try {
          quillInstance.current.off('text-change')
          // Don't clear the DOM in cleanup to prevent issues
        } catch (error) {
          console.log('Cleanup error:', error)
        }
        quillInstance.current = null
        isInitializing.current = false
      }
    }
  }, [isLoaded]) // Only depend on isLoaded, not on onChange or placeholder

  // Separate effect to handle onChange callback updates
  useEffect(() => {
    if (quillInstance.current) {
      // Remove old listeners
      quillInstance.current.off('text-change')
      
      // Add new listener with current onChange
      let timeout: NodeJS.Timeout
      quillInstance.current.on('text-change', () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          if (quillInstance.current) {
            const content = quillInstance.current.root.innerHTML
            onChange(content)
          }
        }, 300)
      })
    }
  }, [onChange])

  // Update content when value prop changes (without re-initializing editor)
  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      const currentSelection = quillInstance.current.getSelection()
      quillInstance.current.root.innerHTML = value
      if (currentSelection) {
        quillInstance.current.setSelection(currentSelection)
      }
    }
  }, [value])

  if (error) {
    return (
      <div className="min-h-[300px] bg-red-50 rounded-md border border-red-200 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-medium">Editor Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[300px] bg-gray-50 rounded-md border flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div 
        ref={editorRef} 
        id={`quill-editor-${editorId}`}
        className="min-h-[300px]" 
      />
    </div>
  )
}