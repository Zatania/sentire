'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? '').trim().toLowerCase()
}

function text(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = normalizeEmail(formData.get('email'))
  const password = text(formData.get('password'))

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: 'Your account profile is missing. Please contact the administrator.' }
  }

  if (profile.role === 'student') {
    const { data: student } = await supabase
      .from('students')
      .select('is_onboarded')
      .eq('user_id', data.user.id)
      .maybeSingle()

    revalidatePath('/', 'layout')

    if (!student?.is_onboarded) {
      redirect('/dashboard/student/onboarding')
    }

    redirect('/dashboard/student')
  }

  revalidatePath('/', 'layout')

  if (profile.role === 'teacher') {
    redirect('/dashboard/teacher')
  }

  if (profile.role === 'admin') {
    redirect('/dashboard/admin')
  }

  return { error: 'Unknown role.' }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const fullName = text(formData.get('full_name'))
  const email = normalizeEmail(formData.get('email'))
  const password = text(formData.get('password'))
  const studentNumber = text(formData.get('student_number'))
  const yearLevelRaw = text(formData.get('year_level'))
  const section = text(formData.get('section'))
  const programId = text(formData.get('program_id'))

  const yearLevel = yearLevelRaw ? Number(yearLevelRaw) : null

  if (!fullName) {
    return { error: 'Full name is required.' }
  }

  if (!email) {
    return { error: 'Email is required.' }
  }

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (!studentNumber) {
    return { error: 'Student ID is required.' }
  }

  if (!programId) {
    return { error: 'Program is required.' }
  }

  if (!yearLevel || !Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 10) {
    return { error: 'Year level must be a valid number between 1 and 10.' }
  }

  if (!section) {
    return { error: 'Section is required.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'User account was not created.' }
  }

  const userId = data.user.id

  const { error: profileError } = await adminSupabase.from('profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    role: 'student',
    status: 'active',
  })

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

  const { error: studentError } = await adminSupabase.from('students').insert({
    user_id: userId,
    student_number: studentNumber,
    program_id: programId,
    year_level: yearLevel,
    section,
    is_onboarded: false,
  })

  if (studentError) {
    await adminSupabase.from('profiles').delete().eq('id', userId)
    await adminSupabase.auth.admin.deleteUser(userId)
    return { error: studentError.message }
  }

  revalidatePath('/', 'layout')

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = normalizeEmail(formData.get('email'))

  if (!email) {
    return { error: 'Email is required.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}