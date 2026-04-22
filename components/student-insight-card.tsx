'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'

interface StudentData {
  id: string
  name: string
  mood: number
  stress: number
  sleepHours?: number | null
  notes?: string | null
  gwa?: number | null
}

interface AnalysisResult {
  detectedEmotion: string
  emotionConfidence: number
  riskLevel: 'At-Risk' | 'Normal'
  riskFactors: string[]
  academicImpact: string
  recommendedActions: string[]
  urgency: 'low' | 'medium' | 'high'
  summary: string
}

const EMOTION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Thriving: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Happy: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Neutral: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  Stressed: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Distressed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const URGENCY_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-800' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-800' },
  high: { bg: 'bg-red-100', text: 'text-red-800' },
}

const MOOD_LABELS = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
const STRESS_LABELS = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Very High']

export function StudentInsightCard({
  student,
  onClose,
  onIntervention,
}: {
  student: StudentData
  onClose?: () => void
  onIntervention?: (studentId: string) => void
}) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runAnalysis() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          journalText: student.notes,
          mood: student.mood,
          stress: student.stress,
          sleepHours: student.sleepHours,
          gwa: student.gwa,
        }),
      })

      if (!res.ok) throw new Error('Failed to analyze')

      const data = await res.json()
      setAnalysis(data.analysis)
    } catch {
      setError('Failed to run AI analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const emotionStyle = analysis
    ? EMOTION_STYLES[analysis.detectedEmotion] || EMOTION_STYLES.Neutral
    : EMOTION_STYLES.Neutral

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                AI Student Analysis
              </h3>
              <p className="text-xs text-muted-foreground">Powered by Groq AI</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Section 1: Student Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-muted-foreground" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Student Wellness Submission
            </h4>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground text-sm">{student.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Mood: {MOOD_LABELS[student.mood]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                  Stress: {STRESS_LABELS[student.stress]}
                </span>
              </div>
            </div>

            {/* Journal/Notes Display */}
            <div className="bg-background rounded-md p-3 border border-border min-h-[80px]">
              {student.notes ? (
                <p className="text-sm text-foreground leading-relaxed italic">
                  &ldquo;{student.notes}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No journal entry or reflection submitted.
                </p>
              )}
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              {student.sleepHours && (
                <span>Sleep: {student.sleepHours}h</span>
              )}
              {student.gwa && (
                <span>GWA: {student.gwa.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: AI Analysis Results */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Groq AI Analysis Results
            </h4>
          </div>

          {!analysis && !loading && (
            <div className="bg-muted/30 rounded-lg p-6 border border-dashed border-border text-center">
              <Brain className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Click below to run AI-powered emotional and risk analysis on this student&apos;s data.
              </p>
              <Button onClick={runAnalysis} className="gap-2">
                <Sparkles size={14} />
                Run AI Analysis
              </Button>
            </div>
          )}

          {loading && (
            <div className="bg-muted/30 rounded-lg p-8 border border-border text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Groq AI is analyzing student data...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={runAnalysis}>
                Try Again
              </Button>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              {/* Detected Emotion & Risk Level Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Detected Emotion */}
                <div className={`rounded-lg p-4 border ${emotionStyle.border} ${emotionStyle.bg}`}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Detected Emotional State
                  </p>
                  <div className="flex items-center gap-2">
                    <Activity size={18} className={emotionStyle.text} />
                    <span className={`font-semibold text-lg ${emotionStyle.text}`}>
                      {analysis.detectedEmotion}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysis.emotionConfidence}% confidence
                  </p>
                </div>

                {/* Risk Level */}
                <div
                  className={`rounded-lg p-4 border ${
                    analysis.riskLevel === 'At-Risk'
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Emotion-Academic Profile Status
                  </p>
                  <div className="flex items-center gap-2">
                    {analysis.riskLevel === 'At-Risk' ? (
                      <>
                        <ShieldAlert size={18} className="text-red-600" />
                        <span className="font-semibold text-lg text-red-700">At-Risk</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="font-semibold text-lg text-green-700">Normal</span>
                      </>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${
                      URGENCY_STYLES[analysis.urgency].bg
                    } ${URGENCY_STYLES[analysis.urgency].text}`}
                  >
                    {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)} Priority
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              {analysis.riskFactors.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <p className="text-xs font-semibold text-amber-800">Risk Factors Identified</p>
                  </div>
                  <ul className="text-sm text-amber-900 space-y-1">
                    {analysis.riskFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">-</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Academic Impact */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Academic Impact Assessment
                </p>
                <p className="text-sm text-foreground">{analysis.academicImpact}</p>
              </div>

              {/* AI Summary */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-2">AI Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Recommended Actions
                </p>
                <div className="space-y-2">
                  {analysis.recommendedActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-background rounded-lg p-3 border border-border"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Action Area */}
        {analysis && (
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onIntervention?.(student.id)}
                className={`flex-1 gap-2 ${
                  analysis.riskLevel === 'At-Risk'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <MessageSquare size={16} />
                Initiate Intervention
                <ArrowRight size={14} />
              </Button>
              <Button variant="outline" onClick={runAnalysis} className="gap-2">
                <Sparkles size={14} />
                Re-analyze
              </Button>
            </div>
            {analysis.riskLevel === 'At-Risk' && (
              <p className="text-xs text-red-600 mt-2 text-center">
                Immediate attention recommended for this student.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
