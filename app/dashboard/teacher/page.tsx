import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherDashboardView } from '@/components/teacher-dashboard-view'

export default async function TeacherDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <TeacherDashboardView profile={profile} email={user.email || ''} />
}