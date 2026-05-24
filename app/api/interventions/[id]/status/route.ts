import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const

type InterventionStatus = (typeof VALID_STATUSES)[number]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const { id } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: viewerProfile } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!viewerProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    if (viewerProfile.role !== 'teacher' && viewerProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers and admins can update intervention status.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const status = body.status as InterventionStatus

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid intervention status.' },
        { status: 400 }
      )
    }

    const { data: intervention, error: updateError } = await admin
      .from('interventions')
      .update({ status })
      .eq('id', id)
      .select(
        `
        id,
        student_id,
        assessment_id,
        created_by_teacher_id,
        status,
        risk_summary,
        action_plan,
        follow_up_date,
        created_at,
        updated_at
      `
      )
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      intervention,
      message: 'Intervention status updated successfully.',
    })
  } catch (error) {
    console.error('Update intervention status error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update intervention status.',
      },
      { status: 500 }
    )
  }
}