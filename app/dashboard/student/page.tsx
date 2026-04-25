import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WellnessDashboardClient } from '@/components/wellness-dashboard-client'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'student') redirect('/dashboard')

  const { data: latestAssessment } = await supabase
    .from('v_student_latest_assessment')
    .select('*')
    .eq('student_id', user.id)
    .maybeSingle()

  return (
    <WellnessDashboardClient
      profile={profile}
      email={user.email!}
      logs={latestAssessment ? [latestAssessment] : []}
    />
  )
}