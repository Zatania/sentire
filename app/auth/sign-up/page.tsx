'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProgramOption = {
  id: string
  code: string
  name: string
}

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const role: 'student' = 'student'
  const [isPending, startTransition] = useTransition()
  const [programs, setPrograms] = useState<ProgramOption[]>([])
  const [programsLoading, setProgramsLoading] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    formData.set('role', 'student')

    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  useEffect(() => {
    let isMounted = true

    async function loadPrograms() {
      try {
        const response = await fetch('/api/programs')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || 'Failed to load programs')
        }

        if (isMounted) {
          setPrograms(result.programs || [])
        }
      } catch (error) {
        console.error('Failed to load programs:', error)
        if (isMounted) {
          setPrograms([])
        }
      } finally {
        if (isMounted) {
          setProgramsLoading(false)
        }
      }
    }

    loadPrograms()

    return () => {
      isMounted = false
    }
  }, [])

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
          <div className="rounded-lg bg-muted p-3 mb-5 text-sm text-muted-foreground">
            Student registration only. Teacher and admin accounts are created by the system administrator.
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
                  <Input
                    id="student_number"
                    name="student_number"
                    type="text"
                    placeholder="2021-12345"
                    required
                    className="bg-background border-border text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="program_id" className="text-xs sm:text-sm font-medium text-card-foreground">
                      Program
                    </Label>

                    <select
                      id="program_id"
                      name="program_id"
                      required
                      disabled={programsLoading}
                      defaultValue=""
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {programsLoading ? 'Loading programs...' : 'Select your program'}
                      </option>

                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.code} - {program.name}
                        </option>
                      ))}
                    </select>

                    {!programsLoading && programs.length === 0 && (
                      <p className="text-xs text-red-600">
                        No programs available. Please contact the administrator.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="year_level" className="text-xs sm:text-sm font-medium text-card-foreground">Year</Label>
                    <Input
                      id="year_level"
                      name="year_level"
                      type="number"
                      min={1}
                      max={10}
                      placeholder="3"
                      required
                      className="bg-background border-border text-sm"
                    />
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
