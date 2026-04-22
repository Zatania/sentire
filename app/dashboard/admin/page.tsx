import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardView } from '@/components/admin-dashboard-view'

export const metadata = {
  title: 'Admin Dashboard - Sentire',
  description: 'Emotion-aware academic monitoring system admin dashboard',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check role from user metadata FIRST
  const userRole = user.user_metadata?.role
  if (userRole !== 'admin') {
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
    console.error('[v0] Admin profile fetch error:', error)
    // Continue anyway - profile is optional
  }

  return (
    <AdminDashboardView 
      profile={profile} 
      email={user.email || ''} 
    />
  )
}
