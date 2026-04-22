'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
        <div className="w-full max-w-sm text-center">
          <img
            src="/images/pup-logo.png"
            alt="Polytechnic University of the Philippines logo"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            We sent a password reset link to your email. Follow the instructions to reset your password.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/pup-logo.png"
            alt="Polytechnic University of the Philippines logo"
            className="w-20 h-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-center">
            Enter your email and we will send you a reset link
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                required
                className="bg-background border-border"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full mt-1">
              {isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
