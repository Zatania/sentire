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
import { createClient } from '@/lib/supabase/client'

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mood === 0 || stress === 0) {
      setError('Please rate both your mood and stress level.')
      return
    }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error: insertError } = await supabase.from('wellness_logs').insert({
        user_id: user.id,
        mood,
        stress,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        notes: notes || null,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      reset()
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
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
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false) }}
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
