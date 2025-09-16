'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, User, Mail, Lock } from 'lucide-react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success: boolean; message: string; credentials?: { name: string; email: string; password: string }; warning?: string} | null>(null)
  const [error, setError] = useState('')

  const createAdminUser = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Failed to create admin user')
      }
    } catch (err) {
      setError('Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to create admin user')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Setup Admin User</CardTitle>
          <CardDescription>
            Create your dashboard administrator account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!result && !error && (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Click the button below to create the default admin user for your News Dashboard.
              </p>
              <Button 
                onClick={createAdminUser} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating Admin User...
                  </div>
                ) : (
                  'Create Admin User'
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  {result.message}
                </h3>
                
                {result.credentials && (
                  <div className="bg-muted rounded-lg p-4 space-y-3 text-left">
                    <h4 className="font-medium text-foreground">Login Credentials:</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <code className="text-sm bg-background px-2 py-1 rounded border">
                          {result.credentials.email}
                        </code>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Password:</span>
                        <code className="text-sm bg-background px-2 py-1 rounded border">
                          {result.credentials.password}
                        </code>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <code className="text-sm bg-background px-2 py-1 rounded border">
                          {result.credentials.name}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">{result.warning}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = '/auth/signin'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Go to Sign In Page
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="flex items-center justify-center text-red-600 mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
              <Button 
                onClick={createAdminUser} 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}