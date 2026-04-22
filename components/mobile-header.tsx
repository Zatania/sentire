'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, HeartPulse, UserCog, LayoutDashboard, GraduationCap, Users } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { useTransition } from 'react'

interface Profile {
  full_name: string | null
  role: string
  course: string | null
  year_level: number | null
}

interface MobileHeaderProps {
  profile: Profile
  email: string
}

const studentNav = [
  { href: '/dashboard', label: 'Wellness', icon: HeartPulse },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCog },
]

const teacherNav = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: GraduationCap },
]

const adminNav = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
]

export function MobileHeader({ profile, email }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
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
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/pup-logo.png"
              alt="PUP logo"
              className="w-8 h-8 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">Sentire</span>
              <span className="text-[9px] text-sidebar-foreground/70 leading-tight">Emotion Aware Academic Monitoring</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
            <span className="font-semibold text-sm">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            {nav.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User profile + logout */}
          <div className="border-t border-sidebar-border px-3 py-4">
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {profile.full_name ?? email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut size={20} />
              {isPending ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
