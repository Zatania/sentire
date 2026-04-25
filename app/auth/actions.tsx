'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  const fullName = text(formData.get('full_name'))
  const email = normalizeEmail(formData.get('email'))
  const password = text(formData.get('password'))
  const studentNumber = text(formData.get('student_number'))
  const yearLevelRaw = text(formData.get('year_level'))
  const section = text(formData.get('section'))
  const programId = text(formData.get('program_id'))

  const yearLevel = yearLevelRaw ? Number(yearLevelRaw) : null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'User account was not created.' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: 'student',
  })

  if (profileError) {
    return { error: profileError.message }
  }

  const { error: studentError } = await supabase.from('students').insert({
    user_id: data.user.id,
    student_number: studentNumber || null,
    program_id: programId || null,
    year_level: Number.isFinite(yearLevel) ? yearLevel : null,
    section: section || null,
    is_onboarded: false,
  })

  if (studentError) {
    return { error: studentError.message }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}