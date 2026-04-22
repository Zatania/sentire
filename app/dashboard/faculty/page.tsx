import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FacultyManagementClient } from '@/components/faculty-management-client'

export const metadata = {
  title: 'Faculty Management - Sentire',
  description: 'Manage faculty accounts and profiles',
}

export default async function FacultyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role

  // Only admins can access faculty management
  if (userRole !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all teachers
  const { data: teachers } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <FacultyManagementClient
      teachers={teachers ?? []}
    />
  )
}
