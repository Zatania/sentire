import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRootPage() {
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
    .single()

  const userRole = profile?.role || user.user_metadata?.role || 'student'

  // Route based on role - prioritize role over default
  if (userRole === 'admin') {
    redirect('/dashboard/admin')
  } else if (userRole === 'teacher') {
    redirect('/dashboard/overview')
  } else {
    // Students go to wellness dashboard
    redirect('/dashboard')
  }
}
