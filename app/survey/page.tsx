'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitWellnessSurvey } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const PROGRAMS = ['DIT', 'DOMT', 'BSOA', 'BEED', 'BPA', 'BSENT']
const YEAR_LEVELS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']

const SURVEY_SECTIONS = [
  {
    title: 'About You',
    questions: [
      {
        key: 'gender',
        label: 'Your Gender',
        options: ['Female', 'Male', 'Other'],
      },
    ],
  },
  {
    title: 'Emotional Awareness (Part 1)',
    questions: [
      {
        key: 'q1',
        label: 'I am clear about my feeling',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q2',
        label: 'I pay attention to how I feel',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q3',
        label: 'I experience my emotions as overwhelming and out of control',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q4',
        label: 'I have no idea how I am feeling',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
    ],
  },
  {
    title: 'Emotional Awareness (Part 2)',
    questions: [
      {
        key: 'q5',
        label: 'I have difficulty making sense out of my feelings',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q6',
        label: 'I am attentive to my feelings',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q7',
        label: 'I know exactly how I am feeling',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q8',
        label: 'I care about what I am feeling',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
    ],
  },
  {
    title: 'Emotion Regulation (Part 1)',
    questions: [
      {
        key: 'q9',
        label: 'I am confused about how I feel',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q10',
        label: 'When I\'m upset, I acknowledge my emotions',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q11',
        label: 'When I\'m upset, I become angry with myself for feeling that way',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q12',
        label: 'When I\'m upset, I become embarrassed for feeling that way',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
    ],
  },
  {
    title: 'Emotion Regulation (Part 2)',
    questions: [
      {
        key: 'q13',
        label: 'When I\'m upset, I have difficulty getting work done',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q14',
        label: 'When I\'m upset, I become out of control',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      {
        key: 'q15',
        label: 'When I\'m upset, I believe that I will remain that way for a long time',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
    ],
  },
]

export default function WellnessSurveyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [autoLoggedIn, setAutoLoggedIn] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [program, setProgram] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [comments, setComments] = useState('')

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function canProceed(): boolean {
    if (step === 0) return fullName.trim() !== '' && email.trim() !== '' && program !== '' && yearLevel !== ''
    if (step >= 1 && step <= 4) {
      const section = SURVEY_SECTIONS[step - 1]
      return section.questions.every((q) => answers[q.key])
    }
    if (step === 5) return true // Comments step - optional
    return true
  }

  function handleNext() {
    if (step < 6) setStep(step + 1)
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await submitWellnessSurvey({
        fullName,
        email,
        program,
        yearLevel,
        answers: { ...answers, q20_comments: comments },
      })
      if (result?.error) {
        setError(result.error)
      } else if (result?.password) {
        setGeneratedPassword(result.password)
        setAutoLoggedIn(result.autoLoggedIn === true)
        setStep(6)

        if (result.autoLoggedIn) {
          setTimeout(() => {
            router.push('/auth/select-role')
          }, 2000)
        }
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
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

      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-2xl">
          {step < 7 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {step === 0 ? 'Student Information' : step >= 1 && step <= 4 ? SURVEY_SECTIONS[step - 1].title : step === 5 ? 'Additional Comments' : 'Review & Submit'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Step {step + 1} of 7
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((step + 1) / 7) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 0 && (
            <div className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-card-foreground mb-1">
                SENTIRE Wellness Survey
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                Complete this survey to register and receive your Sentire account credentials.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="bg-background border-border text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan.delacruz@pup.edu.ph"
                    className="bg-background border-border text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                    Program
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROGRAMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProgram(p)}
                        className={`py-2 px-2 sm:px-3 border text-xs sm:text-sm font-medium transition-colors rounded ${
                          program === p
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                    Year Level
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {YEAR_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setYearLevel(level)}
                        className={`py-2 px-2 sm:px-3 border text-xs sm:text-sm font-medium transition-colors rounded ${
                          yearLevel === level
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step >= 1 && step <= 4 && (
            <div className="bg-card border border-border p-4 sm:p-6">
              <div className="space-y-6">
                {SURVEY_SECTIONS[step - 1].questions.map((question) => (
                  <div key={question.key} className="flex flex-col gap-3">
                    <label className="text-xs sm:text-sm font-medium text-card-foreground">
                      {question.label}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAnswer(question.key, option)}
                          className={`p-2 sm:p-3 border rounded text-xs sm:text-sm font-medium transition-colors ${
                            answers[question.key] === option
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-secondary'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bg-card border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-card-foreground mb-4">
                Additional Comments (Optional)
              </h2>
              <div className="flex flex-col gap-3 mb-4">
                <Label htmlFor="comments" className="text-xs font-semibold uppercase tracking-wide text-card-foreground">
                  Q20. Any additional comments or concerns you'd like to share?
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share any additional thoughts..."
                  className="bg-background border-border text-sm min-h-32"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="bg-card border border-border p-4 sm:p-6 text-center">
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl">✓</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-card-foreground mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                Your Sentire account has been created. {autoLoggedIn ? 'Redirecting to dashboard...' : 'Please save your credentials below.'}
              </p>

              <div className="border border-border p-4 bg-muted/50 text-left mb-6">
                <div className="grid grid-cols-[100px_1fr] gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-medium text-foreground">{email}</span>
                  <span className="text-muted-foreground font-semibold">Password:</span>
                  <span className="font-mono font-bold text-primary">{generatedPassword}</span>
                </div>
              </div>

              {autoLoggedIn ? (
                <p className="text-xs text-emerald-600 mb-6 bg-emerald-50 px-4 py-2 border border-emerald-200 rounded">
                  ✓ You have been automatically logged in. Redirecting to your dashboard...
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mb-6">
                  Your account is ready. Use the email and password above to sign in.
                  You can change your password in Profile Settings after logging in.
                </p>
              )}

              {!autoLoggedIn && (
                <a href="/auth/login">
                  <Button className="w-full">Go to Sign In</Button>
                </a>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {step < 6 && (
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {step < 5 && (
                <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                  Next
                </Button>
              )}
              {step === 5 && (
                <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
                  {isPending ? 'Submitting...' : 'Submit Survey'}
                </Button>
              )}
            </div>
          )}

          {step < 6 && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{' '}
              <a href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign In
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
