'use client'

import React from 'react'
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  Loader2,
  Lock,
  MessageSquarePlus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type InterventionStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

type Intervention = {
  id: string
  student_id: string
  assessment_id: string | null
  created_by_teacher_id: string
  status: InterventionStatus
  risk_summary: string | null
  action_plan: string
  follow_up_date: string | null
  created_at: string
  updated_at: string
}

type InterventionNote = {
  id: string
  intervention_id: string
  author_user_id: string
  author_name?: string
  note: string
  created_at: string
}

type Props = {
  studentId: string
  refreshKey?: number
}

const STATUS_LABELS: Record<InterventionStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const STATUS_CLASSES: Record<InterventionStatus, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function InterventionPanel({ studentId, refreshKey = 0 }: Props) {
  const [intervention, setIntervention] = React.useState<Intervention | null>(null)
  const [notes, setNotes] = React.useState<InterventionNote[]>([])
  const [noteText, setNoteText] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [savingNote, setSavingNote] = React.useState(false)
  const [updatingStatus, setUpdatingStatus] = React.useState<InterventionStatus | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)

  const fetchIntervention = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/interventions/latest?studentId=${studentId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load intervention.')
      }

      setIntervention(data.intervention || null)
      setNotes(data.notes || [])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load intervention.'
      )
    } finally {
      setLoading(false)
    }
  }, [studentId])

  React.useEffect(() => {
    fetchIntervention()
  }, [fetchIntervention, refreshKey])

  async function addNote() {
    if (!intervention) return

    const cleanNote = noteText.trim()

    if (!cleanNote) {
      setError('Please enter a note before saving.')
      return
    }

    try {
      setSavingNote(true)
      setError(null)
      setMessage(null)

      const res = await fetch(`/api/interventions/${intervention.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: cleanNote }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to add note.')
      }

      setNotes((prev) => [data.note, ...prev])
      setNoteText('')
      setMessage('Note added successfully.')
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to add note.'
      )
    } finally {
      setSavingNote(false)
    }
  }

  async function updateStatus(status: InterventionStatus) {
    if (!intervention) return

    try {
      setUpdatingStatus(status)
      setError(null)
      setMessage(null)

      const res = await fetch(`/api/interventions/${intervention.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update status.')
      }

      setIntervention(data.intervention)
      setMessage(`Intervention marked as ${STATUS_LABELS[status]}.`)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update status.'
      )
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading latest intervention...
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Latest Intervention
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track support actions, follow-up notes, and current intervention status.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchIntervention}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      {!intervention ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No intervention has been initiated for this student yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[intervention.status]}`}
              >
                {STATUS_LABELS[intervention.status]}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500 mb-1">Follow-up Date</p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Calendar className="h-4 w-4 text-slate-500" />
                {intervention.follow_up_date
                  ? new Date(intervention.follow_up_date).toLocaleDateString()
                  : 'No follow-up date set'}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Risk Summary
              </p>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {intervention.risk_summary || 'No risk summary provided.'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action Plan
              </p>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {intervention.action_plan}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={intervention.status === 'in_progress' || updatingStatus !== null}
              onClick={() => updateStatus('in_progress')}
              className="gap-2"
            >
              {updatingStatus === 'in_progress' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Mark as In Progress
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={intervention.status === 'resolved' || updatingStatus !== null}
              onClick={() => updateStatus('resolved')}
              className="gap-2"
            >
              {updatingStatus === 'resolved' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Resolve
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={intervention.status === 'closed' || updatingStatus !== null}
              onClick={() => updateStatus('closed')}
              className="gap-2"
            >
              {updatingStatus === 'closed' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Close
            </Button>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-slate-700" />
              <h5 className="text-sm font-bold text-slate-900">Notes</h5>
            </div>

            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add follow-up note, action taken, student response, or recommendation..."
                rows={3}
              />

              <Button
                type="button"
                size="sm"
                onClick={addNote}
                disabled={savingNote}
                className="gap-2"
              >
                {savingNote ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                )}
                Add Note
              </Button>
            </div>

            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-700">
                        {note.author_name || 'Unknown user'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                <Lock className="h-4 w-4" />
                No notes added yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}