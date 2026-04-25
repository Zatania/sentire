import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileHeader } from '@/components/mobile-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.role) {
    redirect('/auth/select-role')
  }

  let course: string | null = null
  let yearLevel: number | null = null

  if (profile.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('year_level, program_id')
      .eq('user_id', user.id)
      .maybeSingle()

    yearLevel = student?.year_level ?? null

    if (student?.program_id) {
      const { data: program } = await supabase
        .from('programs')
        .select('code')
        .eq('id', student.program_id)
        .maybeSingle()

      course = program?.code ?? null
    }
  }

  const safeProfile = {
    full_name: profile.full_name ?? null,
    role: profile.role,
    course,
    year_level: yearLevel,
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      <div className="hidden lg:block h-full">
        <AppSidebar profile={safeProfile} email={user.email ?? ''} />
      </div>

      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
        <MobileHeader profile={safeProfile} email={user.email ?? ''} />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}