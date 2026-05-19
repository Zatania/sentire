import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile, changePassword } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, created_at, status')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/dashboard')
  }

  let student = null
  let program = null

  if (profile.role === 'student') {
    const { data: studentRow } = await supabase
      .from('students')
      .select('student_number, year_level, program_id, is_onboarded')
      .eq('user_id', user.id)
      .maybeSingle()

    student = studentRow

    if (studentRow?.program_id) {
      const { data: programRow } = await supabase
        .from('programs')
        .select('id, code, name')
        .eq('id', studentRow.program_id)
        .maybeSingle()

      program = programRow
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

            <form action={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  name="full_name"
                  defaultValue={profile.full_name ?? ''}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  value={profile.email ?? ''}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  value={profile.role ?? ''}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-slate-50 capitalize"
                />
              </div>

              {profile.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Number</label>
                    <input
                      name="student_number"
                      defaultValue={student?.student_number ?? ''}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Program</label>
                    <input
                      value={program ? `${program.code} - ${program.name}` : ''}
                      disabled
                      className="w-full border rounded-lg px-3 py-2 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Year Level</label>
                      <input
                        name="year_level"
                        defaultValue={student?.year_level ?? ''}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#800000] text-white"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>

            <form action={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  name="new_password"
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  name="confirm_password"
                  type="password"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-slate-300"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Account Overview</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Account Status</p>
                <p className="font-medium capitalize">{profile.status ?? 'active'}</p>
              </div>

              <div>
                <p className="text-slate-500">Member Since</p>
                <p className="font-medium">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'}
                </p>
              </div>

              {profile.role === 'student' && (
                <>
                  <div>
                    <p className="text-slate-500">Onboarding Completed</p>
                    <p className="font-medium">{student?.is_onboarded ? 'Yes' : 'No'}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Program Code</p>
                    <p className="font-medium">{program?.code ?? '—'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-sm text-slate-600">
              Email is currently read-only and tied to your authentication account.
              Program assignment is managed from the academic setup side.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}