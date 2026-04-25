'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
const STRESS_LABELS = ['Minimal', 'Low', 'Moderate', 'High', 'Very High']
const MOOD_COLORS = [
  'bg-destructive',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-emerald-400',
  'bg-primary',
]
const STRESS_COLORS = [
  'bg-primary',
  'bg-emerald-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-destructive',
]

function ScaleSelector({
  label,
  value,
  onChange,
  labels,
  colors,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  labels: string[]
  colors: string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all border-2 ${
              value === n
                ? `${colors[n - 1]} text-white border-transparent scale-105`
                : 'bg-muted text-muted-foreground border-transparent hover:border-border'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value > 0 ? labels[value - 1] : 'Select a value'}
      </p>
    </div>
  )
}

interface WellnessCheckInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WellnessCheckInModal({ open, onOpenChange }: WellnessCheckInModalProps) {
  const router = useRouter()
  const [mood, setMood] = useState(0)
  const [stress, setStress] = useState(0)
  const [sleepHours, setSleepHours] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setMood(0)
    setStress(0)
    setSleepHours('')
    setNotes('')
    setError(null)
  }

  function getRiskLevel(stressValue: number): 'normal' | 'needs_attention' | 'at_risk' {
    if (stressValue <= 2) return 'normal'
    if (stressValue === 3) return 'needs_attention'
    return 'at_risk'
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mood === 0 || stress === 0) {
      setError('Please rate both your mood and stress level.')
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/wellness/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_type: 'checkin',
            mood: MOOD_LABELS[mood - 1],
            stress_level: stress,
            sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
            journal_text: notes || '',
            risk_level: getRiskLevel(stress),
            answers: [
              {
                question_code: 'daily_mood',
                question_text: 'How is your mood today?',
                answer_value: MOOD_LABELS[mood - 1],
                answer_numeric: mood,
                category: 'Daily Check-In',
              },
              {
                question_code: 'daily_stress',
                question_text: 'How is your stress level today?',
                answer_value: STRESS_LABELS[stress - 1],
                answer_numeric: stress,
                category: 'Daily Check-In',
              },
              {
                question_code: 'sleep_hours',
                question_text: 'How many hours did you sleep?',
                answer_value: sleepHours || null,
                answer_numeric: sleepHours ? parseFloat(sleepHours) : null,
                category: 'Daily Check-In',
              },
              {
                question_code: 'daily_notes',
                question_text: 'Anything on your mind today?',
                answer_value: notes || null,
                answer_numeric: null,
                category: 'Daily Check-In',
              },
            ],
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || 'Failed to save check-in')
        }

        reset()
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save check-in')
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Daily Check-In</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            How are you feeling today? This only takes a minute.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <ScaleSelector
            label="Mood"
            value={mood}
            onChange={setMood}
            labels={MOOD_LABELS}
            colors={MOOD_COLORS}
          />

          <ScaleSelector
            label="Stress Level"
            value={stress}
            onChange={setStress}
            labels={STRESS_LABELS}
            colors={STRESS_COLORS}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleep" className="text-sm font-medium text-foreground">
              Sleep Hours <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <input
              id="sleep"
              type="number"
              min={0}
              max={24}
              step={0.5}
              placeholder="e.g. 7.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Anything on your mind today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? 'Saving...' : 'Save Check-In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}