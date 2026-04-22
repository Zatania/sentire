import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const admin = createAdminClient()

    const email = 'pupmulanay@gmail.com'
    const password = 'sentirepupm'

    // Delete existing user if any, then recreate
    const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({ error: 'Failed to list users: ' + listError.message }, { status: 500 })
    }

    const existing = existingUsers?.users?.find((u) => u.email === email)

    if (existing) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(existing.id)
      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete existing user: ' + deleteError.message }, { status: 500 })
      }
    }

    // Create user with admin API — auto-confirmed
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'PUP Mulanay Admin',
        role: 'teacher',
      },
    })

    if (authError) {
      return NextResponse.json({ error: 'Failed to create user: ' + authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation returned no user' }, { status: 500 })
    }

    // Insert profile
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: authData.user.id,
        full_name: 'PUP Mulanay Admin',
        role: 'teacher',
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      return NextResponse.json({ error: 'Failed to create profile: ' + profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully!',
      credentials: {
        email,
        password,
      },
      user_id: authData.user.id,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error: ' + String(err) }, { status: 500 })
  }
}
