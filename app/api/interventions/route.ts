import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: 'Teachers or admins only' }, { status: 403 })
    }

    const { studentId, actionPlan } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: studentProfile } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', studentId)
      .maybeSingle()

    if (!studentProfile || studentProfile.role !== 'student') {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('interventions')
      .insert({
        student_id: studentId,
        created_by: user.id,
        status: 'open',
        action_plan:
          actionPlan ||
          'Schedule a wellness check-in with the student and document the support action.',
      })
      .select('id, student_id, created_by, status, action_plan, created_at')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      intervention: data,
      message: 'Intervention created successfully.',
    })
  } catch (error) {
    console.error('Create intervention error:', error)
    return NextResponse.json(
      { error: 'Failed to create intervention.' },
      { status: 500 }
    )
  }
}