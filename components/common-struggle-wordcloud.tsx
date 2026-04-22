'use client'

import { Card } from '@/components/ui/card'
import { MessageSquareOff } from 'lucide-react'

interface WordItem {
  text: string
  frequency: number
  color: string
}

// 1. ADD PROPS INTERFACE
interface WordCloudProps {
  data?: WordItem[]
}

// 2. UPDATE COMPONENT TO USE PROPS
export function CommonStruggleWordCloud({ data = [] }: WordCloudProps) {
  // If no data is passed, show an "Empty State" instead of fake words
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Common Struggles</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time challenges from student feedback</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageSquareOff className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-500 font-medium">No Feedback Data Yet</p>
          <p className="text-xs text-slate-400">Common struggles will appear here once student comments are analyzed.</p>
        </div>
      </Card>
    )
  }

  const maxFrequency = Math.max(...data.map(w => w.frequency))

  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Common Struggles</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Most frequently mentioned challenges in feedback</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {data.map((word, idx) => {
          const sizeMultiplier = (word.frequency / maxFrequency) * 0.6 + 0.4
          const fontSize = `${0.875 + sizeMultiplier * 0.75}rem`

          return (
            <div
              key={idx}
              className="px-3 py-2 rounded-full transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: `${word.color}20`,
                borderColor: word.color,
                borderWidth: '1px',
                fontSize,
                fontWeight: 500,
                color: word.color,
              }}
              title={`Mentioned ${word.frequency} times`}
            >
              {word.text}
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Word size represents frequency of mention in student feedback.
        </p>
      </div>
    </Card>
  )
}