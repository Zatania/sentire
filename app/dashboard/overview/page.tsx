import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherDashboardView } from '@/components/teacher-dashboard-view'

export const metadata = {
  title: 'Teacher Dashboard - Sentire',
  description: 'Teacher portal for monitoring student wellness',
}

export default async function TeacherOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check role from user metadata FIRST
  const userRole = user.user_metadata?.role
  if (userRole !== 'teacher') {
    redirect('/dashboard')
  }

  // Fetch additional profile data (but don't block on it)
  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle()
    profile = data
  } catch (error) {
    console.error('[v0] Teacher profile fetch error:', error)
    // Continue anyway - profile is optional
  }

  return (
    <TeacherDashboardView 
      profile={profile} 
      email={user.email || ''} 
    />
  )
}
