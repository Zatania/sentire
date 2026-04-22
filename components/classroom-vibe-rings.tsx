'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Wind } from 'lucide-react'

interface VibeData {
  name: string
  value: number
  color: string
  emoji: string
}

interface ClassroomVibeRingsProps {
  data?: VibeData[]
}

export function ClassroomVibeRings({ data = [] }: ClassroomVibeRingsProps) {
  // If no data is passed from the parent, show the "Clear" state
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Classroom Vibe Rings</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Dominant emotion per section</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
            <Wind className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">No Vibe Data Yet</p>
            <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
              Section emotions will appear here once students begin their daily check-ins.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Classroom Vibe Rings</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Dominant emotion per section</p>
      </div>

      <div className="space-y-6">
        {data.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.emoji}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {section.name}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {section.value}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${section.value}%`,
                  backgroundColor: section.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}