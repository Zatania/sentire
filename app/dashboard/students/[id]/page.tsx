import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: viewer } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (viewer?.role !== 'teacher' && viewer?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', params.id)
    .maybeSingle()

  const { data: studentRow } = await supabase
    .from('students')
    .select('student_number, year_level, section, program_id')
    .eq('user_id', params.id)
    .maybeSingle()

  let program = null
  if (studentRow?.program_id) {
    const { data } = await supabase
      .from('programs')
      .select('code, name')
      .eq('id', studentRow.program_id)
      .maybeSingle()
    program = data
  }

  const { data: assessments } = await supabase
    .from('wellness_assessments')
    .select('*')
    .eq('student_id', params.id)
    .order('submitted_at', { ascending: false })

  const { data: interventions } = await supabase
    .from('interventions')
    .select('*')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-semibold">{studentProfile?.full_name ?? 'Student'}</h1>
        <p className="text-sm text-slate-500">{studentProfile?.email ?? ''}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Student No:</span> {studentRow?.student_number ?? '—'}</div>
          <div><span className="font-medium">Program:</span> {program?.code ?? '—'}</div>
          <div><span className="font-medium">Year Level:</span> {studentRow?.year_level ?? '—'}</div>
          <div><span className="font-medium">Section:</span> {studentRow?.section ?? '—'}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Wellness History</h2>
        <div className="space-y-3">
          {(assessments ?? []).map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{item.assessment_type}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(item.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm">
                  <p>Risk: {item.risk_level ?? '—'}</p>
                  <p>Stress: {item.stress_level ?? '—'}</p>
                </div>
              </div>
              {item.ai_summary && (
                <p className="mt-3 text-sm text-slate-700">{item.ai_summary}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Interventions</h2>
        <div className="space-y-3">
          {(interventions ?? []).map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <p className="font-medium">{item.status}</p>
              <p className="text-sm text-slate-700 mt-1">{item.action_plan}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}