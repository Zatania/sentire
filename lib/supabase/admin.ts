import { createClient } from '@supabase/supabase-js'

// Admin client using service_role key — bypasses RLS.
// Only use server-side in trusted code (server actions, API routes).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
