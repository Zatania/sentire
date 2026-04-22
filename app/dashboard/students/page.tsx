import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherPortalClient from '@/components/teacher-portal-client'

export default async function StudentsPage() {
  const supabase = await createClient()

  // 1. Verify User Session & Role on the Server
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // SECURITY: If a student tries to manually type /dashboard/students, 
  // kick them to their own wellness page.
  if (profile?.role === 'student') {
    redirect('/dashboard/wellness')
  }

  // 2. Fetch all student profiles
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, student_id, course, year_level, created_at')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  // 3. Fetch most recent wellness log per student
  const { data: wellnessLogs } = await supabase
    .from('wellness_logs')
    .select('user_id, mood, stress, sleep_hours, notes, logged_at')
    .order('logged_at', { ascending: false })

  // 4. Fetch all academic records
  const { data: academicRecords } = await supabase
    .from('academics')
    .select('id, user_id, subject, grade, units, semester, school_year')

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <TeacherPortalClient
        students={students ?? []}
        wellnessLogs={wellnessLogs ?? []}
        academicRecords={academicRecords ?? []}
      />
    </div>
  )
}