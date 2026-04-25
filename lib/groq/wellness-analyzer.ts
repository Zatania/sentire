import Groq from 'groq-sdk'

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

type WellnessAssessment = {
  id: string
  assessment_type?: string | null
  submitted_at?: string | null
  overall_score?: number | null
  risk_level?: 'normal' | 'needs_attention' | 'at_risk' | null
  ai_label?: string | null
  ai_summary?: string | null
  mood?: string | null
  stress_level?: number | null
  sleep_hours?: number | null
  journal_text?: string | null
}

function buildFallbackSummary(responses: WellnessAssessment[]): string {
  if (!responses.length) {
    return 'No wellness data available.'
  }

  const atRisk = responses.filter((r) => r.risk_level === 'at_risk').length
  const needsAttention = responses.filter((r) => r.risk_level === 'needs_attention').length
  const normal = responses.filter((r) => r.risk_level === 'normal').length

  const stressValues = responses
    .map((r) => r.stress_level)
    .filter((v): v is number => typeof v === 'number')

  const avgStress = stressValues.length
    ? (stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)
    : 'N/A'

  return [
    `Wellness snapshot: ${normal} normal, ${needsAttention} needing attention, and ${atRisk} at risk.`,
    `Average reported stress level is ${avgStress}.`,
    `AI live analysis is currently unavailable, so this summary is based on saved wellness records only.`,
  ].join(' ')
}

export async function analyzeWellnessSentiment(
  responses: WellnessAssessment[]
): Promise<string> {
  if (!responses.length) {
    return 'No wellness data available for analysis.'
  }

  if (!groq) {
    return buildFallbackSummary(responses)
  }

  const formatted = responses
    .slice(0, 50)
    .map((r, index) => {
      return [
        `Record ${index + 1}`,
        `Type: ${r.assessment_type ?? 'unknown'}`,
        `Date: ${r.submitted_at ?? 'unknown'}`,
        `Risk: ${r.risk_level ?? 'unknown'}`,
        `Mood: ${r.mood ?? 'not provided'}`,
        `Stress Level: ${r.stress_level ?? 'not provided'}`,
        `Sleep Hours: ${r.sleep_hours ?? 'not provided'}`,
        `Overall Score: ${r.overall_score ?? 'not provided'}`,
        `Journal: ${r.journal_text?.trim() || 'No journal text provided'}`,
      ].join('\n')
    })
    .join('\n\n')

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'You are analyzing student wellness monitoring data for school administrators. Give a concise, professional summary. Do not diagnose mental illness. Focus on observable trends, risk distribution, common stress indicators, and practical school support recommendations.',
        },
        {
          role: 'user',
          content: `Analyze the following wellness assessment records and provide:
1. A 2-3 sentence overall wellness summary
2. Key patterns or concerns
3. A short recommendation for teachers/admins

Records:

${formatted}`,
        },
      ],
    })

    const text = completion.choices?.[0]?.message?.content?.trim()

    if (text) {
      return text
    }

    return buildFallbackSummary(responses)
  } catch (error) {
    console.error('Groq API error:', error)
    return buildFallbackSummary(responses)
  }
}

export async function generateMonthlyReport(
  responses: WellnessAssessment[]
): Promise<string> {
  if (!responses.length) {
    return 'No data available for monthly report.'
  }

  if (!groq) {
    return buildFallbackSummary(responses)
  }

  const atRisk = responses.filter((r) => r.risk_level === 'at_risk').length
  const needsAttention = responses.filter((r) => r.risk_level === 'needs_attention').length
  const normal = responses.filter((r) => r.risk_level === 'normal').length

  const stressValues = responses
    .map((r) => r.stress_level)
    .filter((v): v is number => typeof v === 'number')

  const avgStress = stressValues.length
    ? (stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)
    : 'N/A'

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'You are generating a concise wellness report for school administrators. Do not diagnose. Provide trends, concerns, and recommended school actions.',
        },
        {
          role: 'user',
          content: `Generate a brief monthly wellness report from the following statistics:

Normal: ${normal}
Needs Attention: ${needsAttention}
At Risk: ${atRisk}
Average Stress Level: ${avgStress}

Also consider these latest records:
${responses
  .slice(0, 20)
  .map(
    (r, i) =>
      `Record ${i + 1}: Risk=${r.risk_level ?? 'unknown'}, Mood=${r.mood ?? 'n/a'}, Stress=${
        r.stress_level ?? 'n/a'
      }, Journal=${r.journal_text?.trim() || 'none'}`
  )
  .join('\n')}

Provide:
1. Overall trend
2. Top concerns
3. Recommended school interventions`,
        },
      ],
    })

    const text = completion.choices?.[0]?.message?.content?.trim()

    if (text) {
      return text
    }

    return buildFallbackSummary(responses)
  } catch (error) {
    console.error('Groq API error:', error)
    return buildFallbackSummary(responses)
  }
}