'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GraduationCap, BookOpen, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function RoleSelectionClient({
  userEmail,
  userId,
}: {
  userEmail: string
  userId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRoleSelection(role: 'student' | 'teacher') {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Update user profile with selected role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // If selecting teacher role, also create teacher record
      if (role === 'teacher') {
        const { error: teacherError } = await supabase.from('teachers').insert({
          id: userId,
          full_name: '',
          email: userEmail,
        })

        if (teacherError && !teacherError.message.includes('duplicate')) {
          console.warn('Warning: Could not create teacher record:', teacherError)
          // Don't fail, just continue
        }
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to select role. Please try again.'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
          Welcome to Sentire
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Select your role to get started with the Emotion-Aware Academic Monitoring System
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Student Role */}
        <div
          className="cursor-pointer transition-all"
          onClick={() => handleRoleSelection('student')}
        >
          <Card className="h-full p-6 border-2 border-border hover:border-primary hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Student
                </h2>
                <p className="text-sm text-muted-foreground">
                  Track your wellness, emotional state, and academic performance. Get personalized insights and support.
                </p>
              </div>
              <Button
                onClick={() => handleRoleSelection('student')}
                disabled={isLoading}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Selecting...' : 'Continue as Student'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Faculty/Teacher Role */}
        <div
          className="cursor-pointer transition-all"
          onClick={() => handleRoleSelection('teacher')}
        >
          <Card className="h-full p-6 border-2 border-border hover:border-accent hover:shadow-lg transition-all">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-accent/10 p-4 rounded-lg">
                <BookOpen className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Faculty
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monitor student wellness, detect at-risk students, and provide timely interventions.
                </p>
              </div>
              <Button
                onClick={() => handleRoleSelection('teacher')}
                disabled={isLoading}
                className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading ? 'Selecting...' : 'Continue as Faculty'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Info Message */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> You can change your role later in your profile settings. If you are an administrator, you will have access to both student and faculty features.
        </p>
      </div>

      {/* User Info */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>Logged in as: <span className="font-medium">{userEmail}</span></p>
      </div>
    </div>
  )
}
