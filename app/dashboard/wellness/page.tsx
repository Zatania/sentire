'use client'

import { useState } from 'react'
import { Smile, Frown, Brain, Activity, Send } from 'lucide-react'

export default function WellnessPage() {
  const [mood, setMood] = useState(5)
  const [stress, setStress] = useState(1)

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Student Wellness</h1>
        <p className="text-slate-500">How are you feeling today, Maria Mae?</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Smile size={24} />
            <h2 className="font-semibold text-slate-800">Mood Level</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">(5 = Excellent, 1 = Very Low)</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => setMood(val)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${mood === val ? 'bg-emerald-600 text-white scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Stress Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <Brain size={24} />
            <h2 className="font-semibold text-slate-800">Stress Level</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">(5 = High Stress, 1 = Very Calm)</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => setStress(val)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${stress === val ? 'bg-orange-600 text-white scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Check-in */}
        <div className="md:col-span-2">
          <button
            className="w-full bg-[#800000] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#600000] transition-all shadow-lg"
            onClick={() => alert(`Submitted! Mood: ${mood}, Stress: ${stress}`)}
          >
            <Send size={18} />
            Submit Daily Check-in
          </button>
        </div>
      </div>

      {/* Monitoring History Placeholder */}
      <div className="mt-10">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h3>
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <Activity className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-slate-500 text-sm">Your weekly trend will appear here after more check-ins.</p>
        </div>
      </div>
    </div>
  )
}