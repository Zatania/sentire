import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

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
        { error: 'Only teachers and admins can view interventions.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required.' },
        { status: 400 }
      )
    }

    const { data: intervention, error: interventionError } = await admin
      .from('interventions')
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
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (interventionError) {
      return NextResponse.json(
        { error: interventionError.message },
        { status: 500 }
      )
    }

    if (!intervention) {
      return NextResponse.json({
        intervention: null,
        notes: [],
      })
    }

    const { data: notes, error: notesError } = await admin
      .from('intervention_notes')
      .select(
        `
        id,
        intervention_id,
        author_user_id,
        note,
        created_at
      `
      )
      .eq('intervention_id', intervention.id)
      .order('created_at', { ascending: false })

    if (notesError) {
      return NextResponse.json(
        { error: notesError.message },
        { status: 500 }
      )
    }

    const authorIds = Array.from(
      new Set((notes || []).map((note) => note.author_user_id))
    )

    let authorMap: Record<string, string> = {}

    if (authorIds.length > 0) {
      const { data: authors } = await admin
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds)

      authorMap = Object.fromEntries(
        (authors || []).map((author) => [author.id, author.full_name])
      )
    }

    const notesWithAuthors = (notes || []).map((note) => ({
      ...note,
      author_name: authorMap[note.author_user_id] || 'Unknown user',
    }))

    return NextResponse.json({
      intervention,
      notes: notesWithAuthors,
    })
  } catch (error) {
    console.error('Fetch latest intervention error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch latest intervention.',
      },
      { status: 500 }
    )
  }
}