import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '7')

    // Generate chart data for the specified period
    const chartData = []
    const today = new Date()
    
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Generate realistic mock data based on day patterns
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      // Base multiplier for different days
      const baseMultiplier = isWeekend ? 0.6 : 1.0
      
      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
      
      const views = Math.floor((50 + Math.random() * 200) * baseMultiplier * randomFactor)
      const likes = Math.floor(views * (0.02 + Math.random() * 0.03)) // 2-5% like rate
      const shares = Math.floor(views * (0.005 + Math.random() * 0.015)) // 0.5-2% share rate
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        views,
        likes,
        shares
      })
    }

    return NextResponse.json({ chartData })
  } catch (error) {
    console.error('Error fetching analytics charts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics charts' },
      { status: 500 }
    )
  }
}