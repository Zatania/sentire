import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const safeProfile = profile ?? {
    full_name: user.user_metadata?.full_name ?? null,
    role: user.user_metadata?.role ?? 'student',
    course: user.user_metadata?.course ?? null,
    student_id: user.user_metadata?.student_id ?? null,
    year_level: user.user_metadata?.year_level ?? null,
  }

  const privacySettings = {
    invisibilityMode: user.user_metadata?.invisibility_mode ?? false,
    showDataToAdvisor: user.user_metadata?.show_data_to_advisor ?? true,
  }

  return (
    <ProfileClient
      profile={safeProfile}
      email={user.email ?? ''}
      privacySettings={privacySettings}
    />
  )
}
