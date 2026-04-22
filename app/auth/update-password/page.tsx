'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Maroon top header bar */}
      <header className="bg-primary flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3">
        <img
          src="/images/pup-logo.png"
          alt="PUP Logo"
          className="w-8 h-8 sm:w-10 sm:h-10"
        />
        <div>
          <p className="text-primary-foreground text-xs sm:text-sm font-bold tracking-wide">
            Polytechnic University of the Philippines
          </p>
          <p className="text-primary-foreground/70 text-[10px] sm:text-xs">
            Sentire &mdash; Emotion Aware Academic Monitoring System
          </p>
        </div>
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Update Password
            </h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 text-center">
              Enter your new password below
            </p>
          </div>

          <div className="bg-card border border-border p-4 sm:p-6 rounded-xl">
            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Password Updated!</h2>
                <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2">
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
