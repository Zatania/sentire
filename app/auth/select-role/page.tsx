import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Redirecting - Sentire',
  description: 'Redirecting to your Sentire dashboard',
}

export default async function SelectRolePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'student') {
    redirect('/dashboard/student/onboarding')
  }

  if (profile?.role === 'teacher') {
    redirect('/dashboard/teacher')
  }

  if (profile?.role === 'admin') {
    redirect('/dashboard/admin')
  }

  redirect('/auth/login?error=Account+profile+is+missing')
}