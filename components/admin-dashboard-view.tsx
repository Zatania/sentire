'use client'

import React from 'react'

export function AdminDashboardView({ profile, email }) {
  const [sentiment, setSentiment] = React.useState<string | null>(null)
  const [responses, setResponses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortBy, setSortBy] = React.useState('submitted_at')

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch AI sentiment analysis
        const sentimentRes = await fetch('/api/wellness/analyze')
        const sentimentData = await sentimentRes.json()
        setSentiment(sentimentData.sentiment || 'No data available')

        // Fetch all responses
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

  const filteredResponses = responses
    .filter((r) => r.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) || r.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'submitted_at') {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      } else if (sortBy === 'score') {
        return b.score - a.score
      }
      return 0
    })

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Maroon as seen in your screenshot */}
      <aside className="w-64 bg-[#800000] text-white flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8">
          <img src="/OIP-removebg-preview.png" className="h-8 w-8 bg-white rounded-full p-0.5" />
          <span className="font-bold">Sentire Admin</span>
        </div>
        <nav className="flex-1">
          <div className="bg-white/10 p-2 rounded-md flex items-center gap-2">
            <span>Dashboard</span>
          </div>
        </nav>
        <div className="border-t border-white/20 pt-4 mt-auto">
          <p className="text-xs opacity-70 truncate">{email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#FDFCFB] p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hello, {profile?.full_name || 'Admin'}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Stats Summary Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Wellness Index</h2>
            {loading ? (
              <p className="text-slate-500">Loading analysis...</p>
            ) : (
              <div className="text-slate-700 whitespace-pre-wrap">{sentiment}</div>
            )}
          </div>

          {/* Survey Responses Table */}
          <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Survey Responses</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm"
                >
                  <option value="submitted_at">Latest</option>
                  <option value="score">Score</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-slate-500">Loading responses...</p>
            ) : filteredResponses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Score</th>
                      <th className="text-left p-3">Feedback</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((response) => (
                      <tr key={response.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-3">{response.category}</td>
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
                            {response.score}/100
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{response.feedback || 'No feedback'}</td>
                        <td className="p-3 text-slate-500">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
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
