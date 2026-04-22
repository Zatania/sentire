'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Edit2, Trash2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Teacher {
  id: string
  full_name: string
  email: string
  employee_id?: string
  department?: string
  designation?: string
  phone_number?: string
  office_location?: string
  bio?: string
  created_at: string
}

export function FacultyManagementClient({
  teachers: initialTeachers,
}: {
  teachers: Teacher[]
}) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    employee_id: '',
    department: '',
    designation: '',
    phone_number: '',
    office_location: '',
    bio: '',
  })

  const supabase = createClient()

  async function handleSave(teacherId?: string) {
    if (!formData.full_name || !formData.email) {
      alert('Please fill in name and email')
      return
    }

    try {
      if (teacherId) {
        // Update existing
        const { error } = await supabase
          .from('teachers')
          .update(formData)
          .eq('id', teacherId)

        if (error) throw error

        setTeachers(
          teachers.map((t) =>
            t.id === teacherId ? { ...t, ...formData } : t
          )
        )
      } else {
        // Create new - would need auth setup
        alert('To create a new faculty account, they must first sign up and select Faculty role')
      }

      setFormData({
        full_name: '',
        email: '',
        employee_id: '',
        department: '',
        designation: '',
        phone_number: '',
        office_location: '',
        bio: '',
      })
      setEditingId(null)
      setIsAddingNew(false)
    } catch (err) {
      alert('Error saving teacher: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  async function handleDelete(teacherId: string) {
    if (!confirm('Are you sure you want to delete this faculty record?')) return

    try {
      const { error } = await supabase.from('teachers').delete().eq('id', teacherId)
      if (error) throw error
      setTeachers(teachers.filter((t) => t.id !== teacherId))
    } catch (err) {
      alert('Error deleting teacher: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  function startEdit(teacher: Teacher) {
    setFormData({
      full_name: teacher.full_name || '',
      email: teacher.email || '',
      employee_id: teacher.employee_id || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      phone_number: teacher.phone_number || '',
      office_location: teacher.office_location || '',
      bio: teacher.bio || '',
    })
    setEditingId(teacher.id)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Faculty Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage faculty accounts and profiles in the system.
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Faculty members sign up through the system and select the Faculty role. You can edit their profiles here.
        </p>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add New Faculty</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Note: Faculty members must sign up in the system first. This form is for updating their profile information.
          </p>
          <Button
            onClick={() => setIsAddingNew(false)}
            variant="outline"
            className="mt-4"
          >
            Close
          </Button>
        </div>
      )}

      {/* Faculty Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground">
            {teachers.length} Faculty Member{teachers.length !== 1 ? 's' : ''}
          </h2>
          <Button
            size="sm"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="h-8 text-xs sm:text-sm"
          >
            <Plus size={14} className="mr-1" />
            Add Faculty
          </Button>
        </div>

        {teachers.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center text-muted-foreground text-xs sm:text-sm">
            No faculty members yet. Faculty can sign up through the system.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {teachers.map((teacher) => (
              <div key={teacher.id}>
                {editingId === teacher.id ? (
                  <div className="px-4 sm:px-6 py-4 bg-muted/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Email</label>
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 text-sm"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                        <Input
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Department</label>
                        <Input
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Designation</label>
                        <Input
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Phone</label>
                        <Input
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(teacher.id)}
                        className="text-xs sm:text-sm h-8"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="text-xs sm:text-sm h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{teacher.full_name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{teacher.email}</p>
                      {teacher.designation && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{teacher.designation}</p>
                      )}
                      {teacher.department && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{teacher.department}</p>
                      )}
                      {teacher.created_at && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Joined {format(new Date(teacher.created_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(teacher)}
                        className="h-8 text-xs"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => (window.location.href = `mailto:${teacher.email}`)}
                        className="h-8 text-xs"
                      >
                        <Mail size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(teacher.id)}
                        className="h-8 text-xs"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
