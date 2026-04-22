'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export function StudentSurveyView() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const SURVEY_QUESTIONS = [
    {
      key: 'academic_stress',
      label: 'How would you rate your academic stress level?',
      options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
      category: 'Academic',
    },
    {
      key: 'social_connection',
      label: 'How satisfied are you with your social connections?',
      options: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
      category: 'Social',
    },
    {
      key: 'mental_health',
      label: 'How would you describe your overall mental health?',
      options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
      category: 'Mental Health',
    },
    {
      key: 'sleep_quality',
      label: 'How is your sleep quality?',
      options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
      category: 'Physical',
    },
    {
      key: 'work_life_balance',
      label: 'How would you rate your work-life balance?',
      options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
      category: 'Lifestyle',
    },
    {
      key: 'feedback',
      label: 'Any additional feedback or concerns?',
      type: 'textarea',
      category: 'General',
    },
  ]

  const calculateScore = () => {
    const scoreMap = {
      'Very Low': 20,
      'Very Unsatisfied': 20,
      'Very Poor': 20,
      Poor: 40,
      Unsatisfied: 40,
      Fair: 60,
      Neutral: 60,
      Low: 40,
      Moderate: 60,
      High: 40,
      'Very High': 20,
      Satisfied: 80,
      'Very Satisfied': 100,
      Good: 80,
      Excellent: 100,
    }

    let totalScore = 0
    let count = 0

    for (const key in answers) {
      if (key !== 'feedback') {
        const answer = answers[key]
        totalScore += scoreMap[answer] || 0
        count++
      }
    }

    return count > 0 ? Math.round(totalScore / count) : 0
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const score = calculateScore()

      const response = await fetch('/api/wellness/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          feedback: answers.feedback || '',
          category: 'Student Wellness',
          raw_responses: answers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit survey')
      }

      setStep(SURVEY_QUESTIONS.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (step === SURVEY_QUESTIONS.length) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
          <p className="text-slate-600 mb-6">Your wellness survey has been submitted successfully.</p>
          <button
            onClick={() => router.push('/dashboard/student')}
            className="w-full bg-[#800000] text-white py-2 rounded font-semibold hover:bg-[#600000]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = SURVEY_QUESTIONS[step]

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Wellness Survey</h1>
            <span className="text-sm text-slate-600">
              Question {step + 1} of {SURVEY_QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-[#800000] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / SURVEY_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{currentQuestion.label}</h2>

          {currentQuestion.type === 'textarea' ? (
            <textarea
              value={answers[currentQuestion.key] || ''}
              onChange={(e) =>
                setAnswers({ ...answers, [currentQuestion.key]: e.target.value })
              }
              placeholder="Enter your feedback here (optional)"
              className="w-full p-3 border border-slate-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#800000]"
              rows={4}
            />
          ) : (
            <div className="space-y-2">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.key]: option })}
                  className={`w-full p-3 border rounded text-left transition-colors ${
                    answers[currentQuestion.key] === option
                      ? 'bg-[#800000] text-white border-[#800000]'
                      : 'bg-white text-slate-900 border-slate-300 hover:border-[#800000]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex-1 py-2 px-4 border border-slate-300 rounded font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>

          {step === SURVEY_QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-[#800000] text-white rounded font-semibold hover:bg-[#600000] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentQuestion.type !== 'textarea' || answers[currentQuestion.key]) {
                  setStep(step + 1)
                }
              }}
              disabled={!currentQuestion.type && !answers[currentQuestion.key]}
              className="flex-1 py-2 px-4 bg-[#800000] text-white rounded font-semibold hover:bg-[#600000] disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
