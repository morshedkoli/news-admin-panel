import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { dbService } from './db'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Trim whitespace from credentials
          const email = credentials.email.trim().toLowerCase()
          const password = credentials.password.trim()

          const user = await dbService.getUserByEmail(email)

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: Record<string, unknown> }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Record<string, unknown>; token: { [key: string]: unknown; sub?: string; role?: string } }) {
      if (token && session.user) {
        const sessionWithUser = session as { user: { id?: string; role?: string } }
        sessionWithUser.user.id = token.sub!
        sessionWithUser.user.role = token.role as string
      }
      return session
    },
    async signIn({ user }: { user: Record<string, unknown> }) {
      return !!user
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Export with proper typing for use with getServerSession
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions = authConfig as any