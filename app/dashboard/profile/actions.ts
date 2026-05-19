'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function text(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const fullName = text(formData.get('full_name'))
  const studentNumber = text(formData.get('student_number'))
  const yearLevelRaw = text(formData.get('year_level'))
  const yearLevel = yearLevelRaw ? Number(yearLevelRaw) : null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
    })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  if (profile?.role === 'student') {
    const { error: studentError } = await supabase
      .from('students')
      .update({
        student_number: studentNumber || null,
        year_level: Number.isFinite(yearLevel) ? yearLevel : null,
      })
      .eq('user_id', user.id)

    if (studentError) {
      return { error: studentError.message }
    }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard', 'layout')

  return { success: 'Profile updated successfully.' }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  const newPassword = text(formData.get('new_password'))
  const confirmPassword = text(formData.get('confirm_password'))

  if (!newPassword || !confirmPassword) {
    return { error: 'Please fill in both password fields.' }
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password changed successfully.' }
}