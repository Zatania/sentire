'use client'

import { useRouter } from 'next/navigation'

type StudentRow = {
  student_id: string
  full_name: string
  email: string
  student_number: string | null
  program_code: string | null
  year_level: number | null
  section: string | null
  latest_risk_level: string | null
  latest_mood: string | null
  latest_stress_level: number | null
  latest_submitted_at: string | null
}

export default function TeacherPortalClient({
  students,
}: {
  students: StudentRow[]
  wellnessLogs?: any[]
  academicRecords?: any[]
}) {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-slate-500">Monitor latest wellness status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Student No.</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Last Check-in</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() => router.push(`/dashboard/students/${student.student_id}`)}
                  className="cursor-pointer border-t hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium">{student.full_name}</td>
                  <td className="px-4 py-3">{student.student_number ?? '—'}</td>
                  <td className="px-4 py-3">{student.program_code ?? '—'}</td>
                  <td className="px-4 py-3">{student.year_level ?? '—'}</td>
                  <td className="px-4 py-3">{student.latest_risk_level ?? 'No data'}</td>
                  <td className="px-4 py-3">
                    {student.latest_submitted_at
                      ? new Date(student.latest_submitted_at).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}