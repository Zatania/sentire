import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email`)
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/update-password`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('is_onboarded')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!student?.is_onboarded) {
      return NextResponse.redirect(`${origin}/dashboard/student/onboarding`)
    }

    return NextResponse.redirect(`${origin}/dashboard/student`)
  }

  if (profile?.role === 'teacher') {
    return NextResponse.redirect(`${origin}/dashboard/teacher`)
  }

  if (profile?.role === 'admin') {
    return NextResponse.redirect(`${origin}/dashboard/admin`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Account+profile+is+missing`)
}