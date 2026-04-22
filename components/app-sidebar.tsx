'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { useTransition } from 'react'
import {
  LayoutDashboard,
  GraduationCap,
  LogOut,
  HeartPulse,
  UserCog,
} from 'lucide-react'

interface Profile {
  full_name: string | null
  role: string
  course: string | null
  year_level: number | null
}

interface AppSidebarProps {
  profile: Profile
  email: string
}

const studentNav = [
  { href: '/dashboard/wellness', label: 'Wellness', icon: HeartPulse },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCog },
]

const teacherNav = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: GraduationCap },
]

const adminNav = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
]

export function AppSidebar({ profile, email }: AppSidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const nav =
    profile.role === 'admin'
      ? adminNav
      : profile.role === 'teacher'
        ? teacherNav
        : studentNav

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <aside className="hidden lg:flex flex-col h-full bg-sidebar text-sidebar-foreground w-60 shrink-0 border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border bg-[#4a0404]">
        <img
          src="/images/pup-logo.png"
          alt="PUP logo"
          className="w-9 h-9 shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm tracking-tight">Sentire</span>
          <span className="text-[10px] text-white/70 leading-tight">Emotion Aware Monitoring</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
        {nav.map(({ href, label, icon: Icon }) => {
          // THE FIX: Strict equality check for the active state.
          // This prevents the "Overview" button from fighting the "Students" button.
          const isActive = pathname === href || (href === '/dashboard/wellness' && pathname === '/dashboard')

          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : ''} />
              {label}
            </a>
          )
        })}
      </nav>

      {/* User Account & Logout */}
      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium truncate text-sidebar-foreground">
            {profile.full_name ?? email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          {isPending ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}