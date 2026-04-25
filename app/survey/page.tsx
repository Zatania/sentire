import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentSurveyView } from '@/components/student-survey-view'

export default async function WellnessSurveyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-up')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'student') {
    redirect('/dashboard')
  }

  const { data: student } = await supabase
    .from('students')
    .select('is_onboarded')
    .eq('user_id', user.id)
    .maybeSingle()

  if (student?.is_onboarded) {
    redirect('/dashboard/student')
  }

  return <StudentSurveyView />
}