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

    // Check if user is admin or teacher
    const { data: adminProfile } = await supabase
      .from('profiles_admin')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: teacherProfile } = await supabase
      .from('profiles_teachers')
      .select('id, department')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminProfile && !teacherProfile) {
      // If neither admin nor teacher, return only their own responses
      const { data: responses, error } = await supabase
        .from('student_survey_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ responses: responses || [] })
    }

    // Admin or teacher can see all responses
    const { data: responses, error } = await supabase
      .from('student_survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ responses: responses || [] })
  } catch (error) {
    console.error('Wellness responses error:', error)
    return NextResponse.json({ error: 'Failed to fetch wellness responses' }, { status: 500 })
  }
}
