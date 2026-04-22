import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('profiles_admin')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminProfile) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get last 50 responses
    const { data: responses, error } = await supabase
      .from('student_survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(50)

    if (error) throw error

    if (!responses || responses.length === 0) {
      return NextResponse.json({
        sentiment: 'No survey data available for analysis.',
        status: 'no_data',
      })
    }

    // Use Groq to analyze
    const { analyzeWellnessSentiment } = await import('@/lib/groq/wellness-analyzer')

    const sentiment = await analyzeWellnessSentiment(responses)

    return NextResponse.json({
      sentiment,
      responseCount: responses.length,
      status: 'success',
    })
  } catch (error) {
    console.error('Wellness analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze wellness data' }, { status: 500 })
  }
}
