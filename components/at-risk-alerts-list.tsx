'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, User } from 'lucide-react'

interface AlertItem {
  id: string
  student_name: string
  issue: string
  severity: 'high' | 'medium'
  timestamp: string
}

interface AtRiskAlertsListProps {
  data?: AlertItem[]
  onAlertsChange?: (count: number) => void
}

export function AtRiskAlertsList({ data = [], onAlertsChange }: AtRiskAlertsListProps) {

  // Sync the notification bubble count with the actual data length
  useEffect(() => {
    if (onAlertsChange) {
      onAlertsChange(data.length)
    }
  }, [data, onAlertsChange])

  // Empty State: Show this when no students are flagged
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">At-Risk Alerts</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Students requiring immediate attention</p>
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
            0 Active
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-slate-900 dark:text-slate-50 font-medium">All systems clear</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mt-1">
            No students currently meet the threshold for wellness alerts.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">At-Risk Alerts</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Students requiring immediate attention</p>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-xs font-medium text-red-600 dark:text-red-400">
          {data.length} Active
        </div>
      </div>

      <div className="space-y-4">
        {data.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className={`p-2 rounded-full ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{alert.student_name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{alert.issue}</p>
              <p className="text-[10px] text-slate-400 mt-1">{alert.timestamp}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8">View</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}