'use client'

import React from 'react'
import { StudentInsightCard } from '@/components/student-insight-card'

type TeacherResponseRow = {
  student_id: string
  full_name: string
  email: string
  student_number: string | null
  program_code: string | null
  year_level: number | null
  section: string | null
  latest_assessment_id: string | null
  latest_assessment_type: string | null
  latest_submitted_at: string | null
  latest_risk_level: 'normal' | 'needs_attention' | 'at_risk' | null
  latest_ai_label: string | null
  latest_ai_summary: string | null
  latest_mood: string | null
  latest_stress_level: number | null
  latest_sleep_hours: number | null
}

type StudentDetail = {
  id: string
  name: string
  mood: number
  stress: number
  sleepHours?: number | null
  notes?: string | null
  gwa?: number | null
}

export function TeacherDashboardView({
  profile,
  email,
}: {
  profile: any
  email: string
}) {
  const [responses, setResponses] = React.useState<TeacherResponseRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [studentDetails, setStudentDetails] = React.useState<Record<string, StudentDetail>>({})
  const [loadingDetailId, setLoadingDetailId] = React.useState<string | null>(null)

  const [interventionRefreshKeys, setInterventionRefreshKeys] = React.useState<Record<string, number>>({})
  const [interventionLoadingId, setInterventionLoadingId] = React.useState<string | null>(null)
  const [interventionMessage, setInterventionMessage] = React.useState<string | null>(null)
  const [interventionError, setInterventionError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responsesRes = await fetch('/api/wellness/responses')
        const responsesData = await responsesRes.json()
        setResponses(responsesData.responses || [])
      } catch (error) {
        console.error('Failed to fetch wellness data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function toggleStudent(row: TeacherResponseRow) {
    if (expandedId === row.student_id) {
      setExpandedId(null)
      return
    }

    setExpandedId(row.student_id)

    if (studentDetails[row.student_id]) return

    try {
      setLoadingDetailId(row.student_id)
      const res = await fetch(`/api/students/${row.student_id}/latest`)
      const data = await res.json()
      if (res.ok && data.student) {
        setStudentDetails((prev) => ({ ...prev, [row.student_id]: data.student }))
      }
    } catch (error) {
      console.error('Failed to load student detail:', error)
    } finally {
      setLoadingDetailId(null)
    }
  }

  const filteredResponses = responses.filter((r) => {
    const q = searchTerm.toLowerCase()
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.program_code?.toLowerCase().includes(q) ||
      r.latest_ai_summary?.toLowerCase().includes(q) ||
      r.latest_mood?.toLowerCase().includes(q) ||
      r.latest_risk_level?.toLowerCase().includes(q)
    )
  })

  const totalStudents = responses.length
  const atRiskCount = responses.filter((r) => r.latest_risk_level === 'at_risk').length
  const needsAttentionCount = responses.filter((r) => r.latest_risk_level === 'needs_attention').length
  const averageStress =
    responses.length > 0
      ? Math.round(
          responses.reduce((sum, r) => sum + (r.latest_stress_level ?? 0), 0) / responses.length
        )
      : 0

  function getStatusClasses(riskLevel: string | null) {
    if (riskLevel === 'normal') return 'bg-green-100 text-green-800'
    if (riskLevel === 'needs_attention') return 'bg-yellow-100 text-yellow-800'
    if (riskLevel === 'at_risk') return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-700'
  }

  function getStatusLabel(riskLevel: string | null) {
    if (riskLevel === 'normal') return 'Normal'
    if (riskLevel === 'needs_attention') return 'Needs Attention'
    if (riskLevel === 'at_risk') return 'At Risk'
    return 'No Data'
  }

  async function initiateIntervention(studentId: string) {
    try {
      setInterventionLoadingId(studentId)
      setInterventionMessage(null)
      setInterventionError(null)

      const row = responses.find((r) => r.student_id === studentId)

      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          assessmentId: row?.latest_assessment_id ?? null,
          riskSummary:
            row?.latest_ai_summary ||
            row?.latest_ai_label ||
            'Student has been flagged for wellness monitoring.',
          actionPlan:
            row?.latest_ai_summary ||
            'Schedule a wellness check-in with the student and document the support action.',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to initiate intervention.')
      }

      setInterventionMessage('Intervention successfully initiated.')

      setInterventionRefreshKeys((prev) => ({
        ...prev,
        [studentId]: (prev[studentId] || 0) + 1,
      }))
    } catch (error) {
      setInterventionError(
        error instanceof Error
          ? error.message
          : 'Failed to initiate intervention.'
      )
    } finally {
      setInterventionLoadingId(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 bg-[#FDFCFB] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hello, {profile?.full_name || 'Teacher'}
          </h1>
          <p className="text-slate-600 mt-2">Monitor your students’ latest wellness status.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Class Sentiment Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
                <p className="text-slate-600 text-sm">Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-700">{atRiskCount}</p>
                <p className="text-slate-600 text-sm">At Risk</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{needsAttentionCount}</p>
                <p className="text-slate-600 text-sm">Needs Attention</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{averageStress}</p>
                <p className="text-slate-600 text-sm">Avg. Stress</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Student Wellness Responses</h2>
              <input
                type="text"
                placeholder="Search name, mood, program, summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm"
              />
            </div>

            {loading ? (
              <p className="text-slate-500">Loading data...</p>
            ) : filteredResponses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Program</th>
                      <th className="text-left p-3">Mood</th>
                      <th className="text-left p-3">Stress</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Summary</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response) => (
                      <React.Fragment key={response.student_id}>
                        <tr
                          className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => toggleStudent(response)}
                        >
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{response.full_name}</div>
                            <div className="text-xs text-slate-500">{response.email}</div>
                          </td>
                          <td className="p-3">{response.program_code || '—'}</td>
                          <td className="p-3">{response.latest_mood || '—'}</td>
                          <td className="p-3">{response.latest_stress_level ?? '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClasses(response.latest_risk_level)}`}>
                              {getStatusLabel(response.latest_risk_level)}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">
                            {response.latest_ai_summary || response.latest_ai_label || 'No summary'}
                          </td>
                          <td className="p-3 text-slate-500">
                            {response.latest_submitted_at
                              ? new Date(response.latest_submitted_at).toLocaleDateString()
                              : '—'}
                          </td>
                        </tr>

                        {expandedId === response.student_id && (
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td colSpan={7} className="p-4">
                              {loadingDetailId === response.student_id ? (
                                <p className="text-sm text-slate-500">Loading student analysis…</p>
                              ) : studentDetails[response.student_id] ? (
                                <div className="space-y-3">
                                  <StudentInsightCard
                                    student={studentDetails[response.student_id]}
                                    onIntervention={initiateIntervention}
                                    interventionRefreshKey={interventionRefreshKeys[response.student_id] || 0}
                                  />

                                  {interventionLoadingId === response.student_id && (
                                    <p className="text-sm text-slate-500">Creating intervention...</p>
                                  )}

                                  {interventionMessage && (
                                    <p className="text-sm text-green-700">{interventionMessage}</p>
                                  )}

                                  {interventionError && (
                                    <p className="text-sm text-red-700">{interventionError}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">Unable to load student details.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500">No responses found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}