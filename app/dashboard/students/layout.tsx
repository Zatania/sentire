import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: student_profile } = await supabase
    .from('stduent_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = student_profile?.role || user.user_metadata?.role || 'student'

  // Only teachers can access this page
  if (userRole !== 'teacher') {
    redirect('/dashboard')
  }

  // Just pass children through - parent layout already has the sidebar
  return <>{children}</>
}
