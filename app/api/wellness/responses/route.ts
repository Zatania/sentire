import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role === 'student') {
      const { data, error } = await supabase
        .from('wellness_assessments')
        .select('*')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ responses: data ?? [] })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('v_student_summary')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ responses: data ?? [] })
  } catch (error) {
    console.error('Wellness responses error:', error)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }
}