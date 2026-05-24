import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
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
      .select('id, role, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!viewerProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    if (viewerProfile.role !== 'teacher' && viewerProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers and admins can add intervention notes.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const note = String(body.note || '').trim()

    if (!note) {
      return NextResponse.json(
        { error: 'Note is required.' },
        { status: 400 }
      )
    }

    const { data: intervention } = await admin
      .from('interventions')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention not found.' },
        { status: 404 }
      )
    }

    const { data: createdNote, error: insertError } = await admin
      .from('intervention_notes')
      .insert({
        intervention_id: id,
        author_user_id: user.id,
        note,
      })
      .select('id, intervention_id, author_user_id, note, created_at')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      note: {
        ...createdNote,
        author_name: viewerProfile.full_name,
      },
      message: 'Note added successfully.',
    })
  } catch (error) {
    console.error('Create intervention note error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to add intervention note.',
      },
      { status: 500 }
    )
  }
}