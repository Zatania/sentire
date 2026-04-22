'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { BarChart3 } from 'lucide-react'

interface HeatmapData {
  range: string
  happy: number
  neutral: number
  stressed: number
  burnedOut: number
}

interface EmotionPerformanceHeatmapProps {
  data?: HeatmapData[]
}

export function EmotionPerformanceHeatmap({ data = [] }: EmotionPerformanceHeatmapProps) {
  // Clear State: Show this when Supabase returns no data
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Emotion-Performance Correlation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Average student mood vs recent quiz scores</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
            <BarChart3 className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">No Correlation Data</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              This chart will populate once student academic scores are linked with their wellness check-ins.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Emotion-Performance Correlation</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Average student mood vs recent quiz scores</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="range" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="happy" stackId="a" fill="#22c55e" />
            <Bar dataKey="neutral" stackId="a" fill="#94a3b8" />
            <Bar dataKey="stressed" stackId="a" fill="#f59e0b" />
            <Bar dataKey="burnedOut" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}