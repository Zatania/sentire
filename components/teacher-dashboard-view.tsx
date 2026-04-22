'use client'

import React from 'react'

export function TeacherDashboardView({ profile, email }) {
  const [students, setStudents] = React.useState<any[]>([])
  const [responses, setResponses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterDepartment, setFilterDepartment] = React.useState('')

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all survey responses
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

  const filteredResponses = responses.filter((r) =>
    r.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const averageScore =
    responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length) : 0

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#800000] text-white flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8">
          <img src="/OIP-removebg-preview.png" className="h-8 w-8 bg-white rounded-full p-0.5" />
          <span className="font-bold">Sentire Teacher</span>
        </div>
        <nav className="flex-1">
          <div className="bg-white/10 p-2 rounded-md flex items-center gap-2">
            <span>Dashboard</span>
          </div>
        </nav>
        <div className="border-t border-white/20 pt-4 mt-auto">
          <p className="text-xs opacity-70">{profile?.department}</p>
          <p className="text-xs opacity-70 truncate">{email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#FDFCFB] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hello, {profile?.full_name || 'Teacher'}
          </h1>
          <p className="text-slate-600 mt-2">Department: {profile?.department || 'N/A'}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Class Sentiment Overview */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Class Sentiment Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{averageScore}</p>
                <p className="text-slate-600 text-sm">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{responses.length}</p>
                <p className="text-slate-600 text-sm">Total Responses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {responses.filter((r) => r.score >= 70).length}
                </p>
                <p className="text-slate-600 text-sm">Positive Sentiment</p>
              </div>
            </div>
          </div>

          {/* Student Wellness List */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Student Wellness Responses</h2>
              <input
                type="text"
                placeholder="Search feedback..."
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
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Score</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Feedback</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response) => {
                      const isAtRisk = response.score < 50
                      return (
                        <tr key={response.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="p-3">{response.category}</td>
                          <td className="p-3 font-semibold">{response.score}/100</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                response.score >= 70
                                  ? 'bg-green-100 text-green-800'
                                  : response.score >= 50
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {response.score >= 70 ? 'Good' : response.score >= 50 ? 'Caution' : 'At Risk'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">
                            {response.feedback || 'No feedback'}
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(response.submitted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
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
