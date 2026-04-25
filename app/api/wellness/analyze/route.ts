import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzeWellnessSentiment } from '@/lib/groq/wellness-analyzer'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: responses, error } = await admin
      .from('wellness_assessments')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    const sentiment = await analyzeWellnessSentiment(responses ?? [])

    return NextResponse.json({
      sentiment,
      responseCount: responses?.length ?? 0,
      status: 'success',
    })
  } catch (error) {
    console.error('Wellness analysis error:', error)

    return NextResponse.json({
      sentiment:
        'AI analysis is temporarily unavailable. Showing dashboard data without generated sentiment summary.',
      responseCount: 0,
      status: 'fallback',
    })
  }
}