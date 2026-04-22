export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = (formData.get('password') as string).trim()

  // 1. Authenticate the user
  const { error: authError, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Fetch the role (Safe block)
  let userRole = 'student' // default fallback
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (profile?.role) {
      userRole = profile.role
    }
  } catch (e) {
    console.error("Profile fetch failed, defaulting to student path")
  }

  // 3. Clear cache so middleware sees the new session
  revalidatePath('/', 'layout')

  // 4. Determine path based on YOUR actual folders (from image)
  let targetPath = '/dashboard/students' // Plural as per your app/dashboard/students folder

  if (userRole === 'admin') {
    targetPath = '/dashboard/admin'
  } else if (userRole === 'teacher' || userRole === 'faculty') {
    targetPath = '/dashboard/teacher'
  }

  // 5. Final Redirect
  // This MUST be outside any try/catch blocks
  redirect(targetPath)
}