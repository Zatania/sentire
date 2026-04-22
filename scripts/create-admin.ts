import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createAdminAccount() {
  const email = 'pupmulanay@gmail.com'
  const password = 'sentirepupm'

  // Create user with admin API — auto-confirmed
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'PUP Mulanay Admin',
      role: 'teacher',
    },
  })

  if (authError) {
    console.error('Error creating user:', authError.message)
    return
  }

  console.log('User created:', authData.user?.id)

  // Insert profile
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authData.user!.id,
    full_name: 'PUP Mulanay Admin',
    role: 'teacher',
  }, { onConflict: 'id' })

  if (profileError) {
    console.error('Error creating profile:', profileError.message)
    return
  }

  console.log('Admin account created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
}

createAdminAccount()
