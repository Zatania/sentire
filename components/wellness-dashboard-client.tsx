'use client'

interface WellnessDashboardClientProps {
  profile: any
  email: string
  logs?: any[]
}

export function WellnessDashboardClient({ profile, email }: WellnessDashboardClientProps) {
  return (
    <div className="p-8 bg-white min-h-screen">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Student Wellness Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome, {profile?.full_name || email}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Wellness Overview</h2>
          <p className="text-slate-600 text-sm">Student wellness modules, surveys, and check-ins are available here. Your responses help us better support your wellbeing.</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex gap-3 flex-wrap">
            <a href="/survey" className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#600000] transition-colors text-sm font-medium">
              Complete Wellness Survey
            </a>
            <a href="/dashboard" className="px-4 py-2 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition-colors text-sm font-medium">
              View My Progress
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
