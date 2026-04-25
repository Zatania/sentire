import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function moodToNumber(value: string | null | undefined) {
  if (!value) return 3
  const v = value.toLowerCase()
  if (v.includes('very low')) return 1
  if (v.includes('low')) return 2
  if (v.includes('neutral')) return 3
  if (v.includes('good')) return 4
  if (v.includes('excellent')) return 5
  return 3
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: viewer } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (viewer?.role !== 'teacher' && viewer?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: studentProfile } = await admin
      .from('profiles')
      .select('id, full_name')
      .eq('id', id)
      .maybeSingle()

    const { data: latest } = await admin
      .from('v_student_latest_assessment')
      .select('*')
      .eq('student_id', id)
      .maybeSingle()

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      student: {
        id,
        name: studentProfile.full_name,
        mood: moodToNumber(latest?.mood),
        stress: latest?.stress_level ?? 3,
        sleepHours: latest?.sleep_hours ?? null,
        notes: latest?.journal_text ?? null,
        gwa: null,
      },
    })
  } catch (error) {
    console.error('Latest student detail error:', error)
    return NextResponse.json({ error: 'Failed to load student detail' }, { status: 500 })
  }
}