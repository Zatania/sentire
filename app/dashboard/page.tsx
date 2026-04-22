import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WellnessDashboardClient } from '@/components/wellness-dashboard-client'

export const metadata = {
  title: 'Student Dashboard - Sentire',
  description: 'Student wellness and academic monitoring dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Prioritize user metadata role for routing (this is set at signup)
  const userRole = user.user_metadata?.role || 'student'

  // Route based on role FIRST
  if (userRole === 'teacher') {
    redirect('/dashboard/overview')
  }

  if (userRole === 'admin') {
    redirect('/dashboard/admin')
  }

  // For students, fetch additional profile data (but don't block on it)
  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = data
  } catch (error) {
    console.error('[v0] Profile fetch error:', error)
    // Continue anyway - profile is optional
  }

  return (
    <WellnessDashboardClient
      profile={profile}
      email={user.email!}
      logs={[]}
    />
  )
}
