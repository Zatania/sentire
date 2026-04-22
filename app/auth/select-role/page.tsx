import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoleSelectionClient } from '@/components/role-selection-client'

export const metadata = {
  title: 'Select Role - Sentire',
  description: 'Choose your role to get started with Sentire',
}

export default async function SelectRolePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in, redirect to login
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user already has a role selected
  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    profile = data
  } catch (error) {
    console.error('[v0] Select role profile fetch error:', error)
  }

  // If role is already set, redirect to appropriate dashboard
  if (profile?.role === 'student') {
    redirect('/dashboard') // Students go to wellness dashboard
  } else if (profile?.role === 'teacher') {
    redirect('/dashboard/overview') // Teachers to their overview
  } else if (profile?.role === 'admin') {
    redirect('/dashboard/admin') // Admins to admin dashboard
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="bg-primary flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3">
        <img
          src="/images/pup-logo.png"
          alt="PUP Logo"
          className="w-8 h-8 sm:w-10 sm:h-10"
        />
        <div>
          <p className="text-primary-foreground text-xs sm:text-sm font-bold tracking-wide">
            Polytechnic University of the Philippines
          </p>
          <p className="text-primary-foreground/70 text-[10px] sm:text-xs">
            Sentire &mdash; Emotion Aware Academic Monitoring System
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6">
        <RoleSelectionClient userEmail={user.email ?? ''} userId={user.id} />
      </main>
    </div>
  )
}
