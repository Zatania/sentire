import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
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

  if (!profile) {
    redirect('/auth/select-role')
  }

  if (profile.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('is_onboarded')
      .eq('user_id', user.id)
      .maybeSingle()

    redirect(student?.is_onboarded ? '/dashboard/student' : '/dashboard/student/onboarding')
  }

  if (profile.role === 'teacher') {
    redirect('/dashboard/teacher')
  }

  if (profile.role === 'admin') {
    redirect('/dashboard/admin')
  }

  redirect('/auth/login')
}