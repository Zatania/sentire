import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StudentDashboardActions } from '@/components/student-dashboard-actions'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'student') redirect('/dashboard')

  const { data: student } = await supabase
    .from('students')
    .select('student_number, year_level, section, is_onboarded, program_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let programCode: string | null = null
  if (student?.program_id) {
    const { data: program } = await supabase
      .from('programs')
      .select('code')
      .eq('id', student.program_id)
      .maybeSingle()

    programCode = program?.code ?? null
  }

  const { data: latestAssessment } = await supabase
    .from('v_student_latest_assessment')
    .select('*')
    .eq('student_id', user.id)
    .maybeSingle()

  const { count: historyCount } = await supabase
    .from('wellness_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {profile?.full_name ?? 'Student'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your wellness overview and quick access tools are here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Program</p>
          <p className="text-lg font-semibold mt-1">{programCode ?? '—'}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Year / Section</p>
          <p className="text-lg font-semibold mt-1">
            {student?.year_level ?? '—'} / {student?.section ?? '—'}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Latest Risk</p>
          <p className="text-lg font-semibold mt-1">{latestAssessment?.risk_level ?? 'No data'}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Total Entries</p>
          <p className="text-lg font-semibold mt-1">{historyCount ?? 0}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Latest Wellness Summary</h2>

        {latestAssessment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Assessment Type:</span> {latestAssessment.assessment_type}</p>
              <p><span className="font-medium">Mood:</span> {latestAssessment.mood ?? '—'}</p>
              <p><span className="font-medium">Stress Level:</span> {latestAssessment.stress_level ?? '—'}</p>
              <p><span className="font-medium">Sleep Hours:</span> {latestAssessment.sleep_hours ?? '—'}</p>
            </div>
            <div>
              <p><span className="font-medium">Risk Level:</span> {latestAssessment.risk_level ?? '—'}</p>
              <p><span className="font-medium">Overall Score:</span> {latestAssessment.overall_score ?? '—'}</p>
              <p><span className="font-medium">Submitted:</span> {new Date(latestAssessment.submitted_at).toLocaleString()}</p>
            </div>

            {latestAssessment.ai_summary && (
              <div className="md:col-span-2 mt-2">
                <p className="font-medium mb-1">AI Summary</p>
                <p className="text-slate-700">{latestAssessment.ai_summary}</p>
              </div>
            )}

            {latestAssessment.journal_text && (
              <div className="md:col-span-2 mt-2">
                <p className="font-medium mb-1">Reflection</p>
                <p className="text-slate-700">{latestAssessment.journal_text}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">No wellness data available yet.</p>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <StudentDashboardActions />
      </div>
    </div>
  )
}