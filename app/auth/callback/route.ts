import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If this is a password recovery, redirect to update password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/update-password`)
      }
      // For email confirmation, redirect to role selection
      return NextResponse.redirect(`${origin}/auth/select-role`)
    }
  }

  // Return the user to an error page if something goes wrong
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email`)
}
