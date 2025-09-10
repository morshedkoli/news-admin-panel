'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuth() {
  const [email, setEmail] = useState('admin@newsapp.com')
  const [password, setPassword] = useState('NewsAdmin123!')
  const [result, setResult] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignIn = async () => {
    setLoading(true)
    setResult(null)
    setSession(null)

    try {
      console.log('Testing sign-in with:', { email, password: '***' })
      
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      })

      console.log('Sign-in result:', result)
      setResult(result)

      if (result?.ok) {
        // Get session after successful sign-in
        const sessionData = await getSession()
        console.log('Session data:', sessionData)
        setSession(sessionData)
      }
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Exception occurred', details: error })
    } finally {
      setLoading(false)
    }
  }

  const testSession = async () => {
    try {
      const sessionData = await getSession()
      console.log('Current session:', sessionData)
      setSession(sessionData)
    } catch (error) {
      console.error('Session error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test the NextAuth authentication system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={testSignIn} disabled={loading}>
              {loading ? 'Testing...' : 'Test Sign-In'}
            </Button>
            <Button onClick={testSession} variant="outline">
              Check Session
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              <h3 className="font-semibold">Sign-In Result:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {session && (
            <div className="space-y-2">
              <h3 className="font-semibold">Session Data:</h3>
              <pre className="bg-blue-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}