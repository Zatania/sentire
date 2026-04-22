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

  // 1. Check for valid session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 2. Fetch profile safely
  // FIX: Using maybeSingle() prevents crashes if the user profile doesn't exist yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, course, year_level')
    .eq('id', user.id)
    .maybeSingle()

  // 3. Fallback to metadata if profile role is missing
  const userRole = profile?.role || user.user_metadata?.role

  // 4. FIX: Force role selection if entirely missing
  if (!userRole) {
    redirect('/auth/select-role')
  }

  // 5. Build a safe profile object for our UI components
  const safeProfile = {
    full_name: profile?.full_name ?? null,
    role: userRole,
    course: profile?.course ?? null,
    year_level: profile?.year_level ?? null,
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block h-full">
        <AppSidebar profile={safeProfile} email={user.email ?? ''} />
      </div>

      {/* Main Container */}
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader profile={safeProfile} email={user.email ?? ''} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}