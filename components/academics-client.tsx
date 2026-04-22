'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

interface AcademicRecord {
  id: string
  subject: string
  grade: number | null
  units: number | null
  semester: string | null
  school_year: string | null
  remarks: string | null
  created_at: string
}

function gradeColor(grade: number | null) {
  if (!grade) return 'text-muted-foreground'
  if (grade >= 90) return 'text-primary'
  if (grade >= 75) return 'text-emerald-600'
  if (grade >= 60) return 'text-yellow-600'
  return 'text-destructive'
}

function gwaColor(gwa: number) {
  if (gwa >= 90) return 'text-primary'
  if (gwa >= 75) return 'text-emerald-600'
  if (gwa >= 60) return 'text-yellow-600'
  return 'text-destructive'
}

export function AcademicsClient({ grades }: { grades: AcademicRecord[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // GWA calculation (weighted average)
  const weighted = grades.filter((g) => g.grade && g.units)
  const gwa =
    weighted.length > 0
      ? weighted.reduce((s, g) => s + (g.grade! * g.units!), 0) /
        weighted.reduce((s, g) => s + g.units!, 0)
      : null

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      subject: fd.get('subject') as string,
      grade: fd.get('grade') ? parseFloat(fd.get('grade') as string) : null,
      units: fd.get('units') ? parseFloat(fd.get('units') as string) : null,
      semester: (fd.get('semester') as string) || null,
      school_year: (fd.get('school_year') as string) || null,
      remarks: (fd.get('remarks') as string) || null,
    }
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error: insertError } = await supabase
        .from('academics')
        .insert({ ...payload, user_id: user.id })

      if (insertError) {
        setError(insertError.message)
        return
      }
      setModalOpen(false)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setDeleteId(id)
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('academics').delete().eq('id', id)
      setDeleteId(null)
      router.refresh()
    })
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Academics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your grades and monitor your GWA.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Grade
        </Button>
      </div>

      {/* GWA card */}
      {gwa !== null && (
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              General Weighted Average
            </p>
            <p className={`text-4xl font-bold ${gwaColor(gwa)}`}>{gwa.toFixed(2)}</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <span className="text-xs text-muted-foreground">Total Subjects</span>
            <span className="text-xs font-medium text-foreground">{grades.length}</span>
            <span className="text-xs text-muted-foreground">Total Units</span>
            <span className="text-xs font-medium text-foreground">
              {weighted.reduce((s, g) => s + (g.units ?? 0), 0)}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Grade Records</h2>
        </div>
        {grades.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            No grades added yet. Click &quot;Add Grade&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">School Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Remarks</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground">{g.subject}</td>
                    <td className={`px-6 py-3.5 font-semibold ${gradeColor(g.grade)}`}>
                      {g.grade ?? '—'}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{g.units ?? '—'}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{g.semester ?? '—'}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{g.school_year ?? '—'}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{g.remarks ?? '—'}</td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => handleDelete(g.id)}
                        disabled={isPending && deleteId === g.id}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Grade</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the subject details and your grade.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject" className="text-sm font-medium text-foreground">Subject *</Label>
              <Input id="subject" name="subject" required placeholder="e.g. Data Structures" className="bg-background border-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade" className="text-sm font-medium text-foreground">Grade</Label>
                <Input id="grade" name="grade" type="number" min={0} max={100} step={0.01} placeholder="e.g. 88.5" className="bg-background border-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="units" className="text-sm font-medium text-foreground">Units</Label>
                <Input id="units" name="units" type="number" min={0} max={10} step={0.5} placeholder="e.g. 3" className="bg-background border-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="semester" className="text-sm font-medium text-foreground">Semester</Label>
                <Input id="semester" name="semester" placeholder="1st Semester" className="bg-background border-input" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="school_year" className="text-sm font-medium text-foreground">School Year</Label>
                <Input id="school_year" name="school_year" placeholder="2024-2025" className="bg-background border-input" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="remarks" className="text-sm font-medium text-foreground">Remarks</Label>
              <Input id="remarks" name="remarks" placeholder="Passed, Inc., etc." className="bg-background border-input" />
            </div>
            {error && <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <div className="flex gap-3 justify-end mt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isPending ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
