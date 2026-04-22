import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AcademicsClient } from '@/components/academics-client'

export default async function AcademicsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, course, year_level')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'teacher') redirect('/dashboard/students')

  const { data: grades } = await supabase
    .from('academics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <AcademicsClient grades={grades ?? []} />
}
