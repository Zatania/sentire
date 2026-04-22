'use client'

import { AdminDashboardView } from './admin-dashboard-view'

interface AdminDashboardClientProps {
  profile: any
  email: string
}

export function AdminDashboardClient({ profile, email }: AdminDashboardClientProps) {
  return <AdminDashboardView profile={profile} email={email} />
}
