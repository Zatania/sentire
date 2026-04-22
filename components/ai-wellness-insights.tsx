'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WellnessLog {
  mood: number
  stress: number
}

export function AIWellnessInsights({
  currentMood,
  currentStress,
  recentLogs,
}: {
  currentMood?: number
  currentStress?: number
  recentLogs: WellnessLog[]
}) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  async function fetchInsight() {
    setLoading(true)
    setError(null)
    setDismissed(false)

    try {
      const response = await fetch('/api/wellness-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: currentMood ?? recentLogs[0]?.mood ?? 3,
          stress: currentStress ?? recentLogs[0]?.stress ?? 3,
          recentLogs: recentLogs.slice(0, 5),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get insights')
      }

      const data = await response.json()
      setInsight(data.insight)
    } catch {
      setError('Unable to generate insights right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (dismissed) {
    return null
  }

  // Auto-show suggestions for high stress
  const latestStress = currentStress ?? recentLogs[0]?.stress ?? 3
  const showUrgentSupport = latestStress >= 4

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
          <h3 className="text-xs sm:text-sm font-semibold">AI Wellness Assistant</h3>
        </div>
        {insight && (
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {!insight && !loading && (
        <div className="mt-2 sm:mt-3">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            Get personalized wellness recommendations based on your recent check-ins and emotional patterns.
          </p>
          <Button
            onClick={fetchInsight}
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm h-8 sm:h-9"
          >
            <Sparkles size={12} className="mr-1.5 sm:mr-2 sm:w-[14px] sm:h-[14px]" />
            Get AI Insights
          </Button>
        </div>
      )}

      {loading && (
        <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <RefreshCw size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" />
          Analyzing your wellness data...
        </div>
      )}

      {error && (
        <div className="mt-2 sm:mt-3">
          <p className="text-xs sm:text-sm text-red-600">{error}</p>
          <Button onClick={fetchInsight} variant="ghost" size="sm" className="mt-2 text-xs sm:text-sm h-8">
            Try Again
          </Button>
        </div>
      )}

      {insight && (
        <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-foreground leading-relaxed">{insight}</p>
          <Button
            onClick={fetchInsight}
            variant="ghost"
            size="sm"
            className="text-primary text-xs sm:text-sm h-8"
            disabled={loading}
          >
            <RefreshCw size={12} className={`mr-1.5 sm:mr-2 sm:w-[14px] sm:h-[14px] ${loading ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
        </div>
      )}

      {/* Urgent support for high stress */}
      {showUrgentSupport && !insight && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[10px] sm:text-xs text-amber-800">
            We noticed your stress levels have been elevated. Remember, it is okay to seek help.
            The university counseling center is available if you need support.
          </p>
        </div>
      )}
    </div>
  )
}
