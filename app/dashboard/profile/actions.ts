'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const course = formData.get('course') as string
  const studentId = formData.get('student_id') as string
  const yearLevel = formData.get('year_level') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      course,
      student_id: studentId,
      year_level: yearLevel ? parseInt(yearLevel) : null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Also update user metadata
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      course,
      student_id: studentId,
      year_level: yearLevel,
    },
  })

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Verify current password by trying to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePrivacySettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const invisibilityMode = formData.get('invisibility_mode') === 'on'
  const showDataToAdvisor = formData.get('show_data_to_advisor') === 'on'

  // Update user metadata with privacy settings
  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      invisibility_mode: invisibilityMode,
      show_data_to_advisor: showDataToAdvisor,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
