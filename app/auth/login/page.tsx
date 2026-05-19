'use client'

import { useEffect, useState, useTransition } from 'react'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    const messageParam = params.get('message')

    if (errorParam) {
      setError(errorParam.replace(/\+/g, ' '))
    }

    if (messageParam) {
      setSuccessMessage(messageParam.replace(/\+/g, ' '))
    }
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error)
        }
      } catch (err) {
        console.log('Redirecting...')
      }
    })
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

      {/* Centered login form */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <img
              src="/images/pup-logo.png"
              alt="PUP Logo"
              className="w-14 h-14 sm:w-[72px] sm:h-[72px] mb-2 sm:mb-3"
            />
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Sentire
            </h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 text-center">
              Emotion Aware Academic Monitoring System
            </p>
          </div>

          <div className="bg-card border border-border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-card-foreground mb-4 uppercase tracking-wide">
              Sign In to Your Account
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-card-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@iskolarngbayan.pup.edu.ph"
                  required
                  className="bg-background border-border text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-card-foreground uppercase tracking-wide">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="bg-background border-border text-sm"
                />
              </div>

              {error && (
                <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 border border-destructive/20">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="text-green-700 text-xs bg-green-50 px-3 py-2 border border-green-200">
                  {successMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full mt-2"
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>

              <a
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline font-medium text-center"
              >
                Forgot password?
              </a>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Polytechnic University of the Philippines &copy; 2026
          </p>
        </div>
      </main>
    </div>
  )
}
