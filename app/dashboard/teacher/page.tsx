import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TeacherDashboardView } from '@/components/teacher-dashboard-view'

export default async function TeacherDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  // Get teacher profile
  const { data: profile } = await supabase
    .from('profiles_teachers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return <TeacherDashboardView profile={profile} email={user.email || ''} />
}
