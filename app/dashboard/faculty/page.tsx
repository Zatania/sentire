import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    .maybeSingle()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  const { data: teachers, error } = await admin
    .from('teachers')
    .select(`
      user_id,
      employee_number,
      designation,
      created_at,
      profiles:profiles!teachers_user_id_fkey (
        id,
        full_name,
        email,
        status
      ),
      departments:departments!teachers_department_id_fkey (
        id,
        code,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Faculty page load error:', error)
  }

  const normalizedTeachers =
    teachers?.map((teacher: any) => ({
      id: teacher.user_id,
      full_name: teacher.profiles?.full_name ?? '',
      email: teacher.profiles?.email ?? '',
      employee_id: teacher.employee_number ?? '',
      department: teacher.departments?.name ?? '',
      designation: teacher.designation ?? '',
      created_at: teacher.created_at,
      status: teacher.profiles?.status ?? 'active',
    })) ?? []

  return <FacultyManagementClient teachers={normalizedTeachers} />
}