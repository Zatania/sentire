'use client'

import { useState } from 'react'
import { WellnessCheckInModal } from '@/components/wellness-checkin-modal'

export function StudentDashboardActions() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#800000] text-white"
        >
          New Check-In
        </button>
        <a href="/dashboard/profile" className="px-4 py-2 rounded-lg border">
          View Profile
        </a>
      </div>

      <WellnessCheckInModal open={open} onOpenChange={setOpen} />
    </>
  )
}