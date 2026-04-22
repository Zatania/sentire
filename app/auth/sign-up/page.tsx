'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
        <div className="max-w-sm w-full text-center">
          <img
            src="/images/pup-logo.png"
            alt="Polytechnic University of the Philippines logo"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            We sent a confirmation link to your email address. Please verify it to activate your account.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/pup-logo.png"
            alt="Polytechnic University of the Philippines logo"
            className="w-20 h-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-center">
            Join Sentire to start your wellness journey
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Role toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${
                role === 'student'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all ${
                role === 'teacher'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name" className="text-sm font-medium text-card-foreground">Full Name</Label>
              <Input id="full_name" name="full_name" type="text" placeholder="Juan dela Cruz" required className="bg-background border-border" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@university.edu" required className="bg-background border-border" />
            </div>

            {role === 'student' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="student_id" className="text-xs sm:text-sm font-medium text-card-foreground">Student ID</Label>
                  <Input id="student_id" name="student_id" type="text" placeholder="2021-12345" className="bg-background border-border text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="course" className="text-xs sm:text-sm font-medium text-card-foreground">Course</Label>
                    <Input id="course" name="course" type="text" placeholder="BSIT" className="bg-background border-border text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="year_level" className="text-xs sm:text-sm font-medium text-card-foreground">Year</Label>
                    <Input id="year_level" name="year_level" type="number" min={1} max={6} placeholder="3" className="bg-background border-border text-sm" />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Min. 8 characters" minLength={8} required className="bg-background border-border" />
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full mt-1">
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
