import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherPortalClient from '@/components/teacher-portal-client'

export default async function StudentsPage() {
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

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: students } = await supabase
    .from('v_student_summary')
    .select('*')
    .order('full_name', { ascending: true })

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <TeacherPortalClient
        students={students ?? []}
        wellnessLogs={[]}
        academicRecords={[]}
      />
    </div>
  )
}