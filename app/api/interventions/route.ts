import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: viewerProfile, error: viewerError } = await admin
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (viewerError) {
      return NextResponse.json(
        { error: viewerError.message },
        { status: 500 }
      )
    }

    if (!viewerProfile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      )
    }

    if (viewerProfile.role !== 'teacher' && viewerProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers and admins can initiate interventions.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const studentId = body.studentId as string | undefined
    const assessmentId = body.assessmentId as string | null | undefined
    const actionPlan = body.actionPlan as string | undefined
    const riskSummary = body.riskSummary as string | null | undefined
    const followUpDate = body.followUpDate as string | null | undefined

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required.' },
        { status: 400 }
      )
    }

    const { data: studentRow, error: studentError } = await admin
      .from('students')
      .select('user_id')
      .eq('user_id', studentId)
      .maybeSingle()

    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 500 }
      )
    }

    if (!studentRow) {
      return NextResponse.json(
        { error: 'Student record not found.' },
        { status: 404 }
      )
    }

    let createdByTeacherId = user.id

    if (viewerProfile.role === 'teacher') {
      const { data: teacherRow, error: teacherError } = await admin
        .from('teachers')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (teacherError) {
        return NextResponse.json(
          { error: teacherError.message },
          { status: 500 }
        )
      }

      if (!teacherRow) {
        return NextResponse.json(
          {
            error:
              'Your account role is teacher, but no matching teacher record exists in the teachers table.',
          },
          { status: 400 }
        )
      }

      createdByTeacherId = teacherRow.user_id
    }

    if (viewerProfile.role === 'admin') {
      /*
        Your schema requires created_by_teacher_id to reference public.teachers(user_id).
        Admins are stored in public.admins, so an admin user ID cannot be inserted directly.
        For admin-created interventions, we need a teacher ID.

        This fallback uses the first teacher assigned to the student.
        If none exists, it uses the first teacher in the teachers table.
      */

      const { data: assignedTeacher } = await admin
        .from('teacher_student_assignments')
        .select('teacher_id')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle()

      if (assignedTeacher?.teacher_id) {
        createdByTeacherId = assignedTeacher.teacher_id
      } else {
        const { data: firstTeacher } = await admin
          .from('teachers')
          .select('user_id')
          .limit(1)
          .maybeSingle()

        if (!firstTeacher?.user_id) {
          return NextResponse.json(
            {
              error:
                'Cannot create intervention because the schema requires created_by_teacher_id, but no teacher record exists.',
            },
            { status: 400 }
          )
        }

        createdByTeacherId = firstTeacher.user_id
      }
    }

    const { data: existingOpenIntervention } = await admin
      .from('interventions')
      .select(
        'id, student_id, assessment_id, created_by_teacher_id, status, risk_summary, action_plan, follow_up_date, created_at, updated_at'
      )
      .eq('student_id', studentId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingOpenIntervention) {
      return NextResponse.json({
        intervention: existingOpenIntervention,
        message: 'An active intervention already exists for this student.',
      })
    }

    const { data: intervention, error: insertError } = await admin
      .from('interventions')
      .insert({
        student_id: studentId,
        assessment_id: assessmentId ?? null,
        created_by_teacher_id: createdByTeacherId,
        status: 'open',
        risk_summary: riskSummary ?? null,
        action_plan:
          actionPlan ||
          'Schedule a wellness check-in with the student and document the support action.',
        follow_up_date: followUpDate ?? null,
      })
      .select(
        'id, student_id, assessment_id, created_by_teacher_id, status, risk_summary, action_plan, follow_up_date, created_at'
      )
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      intervention,
      message: 'Intervention created successfully.',
    })
  } catch (error) {
    console.error('Create intervention error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create intervention.',
      },
      { status: 500 }
    )
  }
}