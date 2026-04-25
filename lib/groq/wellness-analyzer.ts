import { generateGeminiText } from '@/lib/ai/gemini'

type WellnessSummaryRow = {
  student_id: string
  full_name?: string | null
  latest_risk_level?: 'normal' | 'needs_attention' | 'at_risk' | null
  latest_mood?: string | null
  latest_stress_level?: number | null
  latest_sleep_hours?: number | null
  latest_ai_summary?: string | null
  latest_submitted_at?: string | null
}

function buildFallbackSummary(rows: WellnessSummaryRow[]): string {
  if (!rows.length) {
    return 'No wellness data available.'
  }

  const atRisk = rows.filter((r) => r.latest_risk_level === 'at_risk').length
  const needsAttention = rows.filter((r) => r.latest_risk_level === 'needs_attention').length
  const normal = rows.filter((r) => r.latest_risk_level === 'normal').length

  const stressValues = rows
    .map((r) => r.latest_stress_level)
    .filter((v): v is number => typeof v === 'number')

  const avgStress = stressValues.length
    ? (stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)
    : 'N/A'

  return [
    `Wellness snapshot: ${normal} normal, ${needsAttention} needing attention, and ${atRisk} at risk.`,
    `Average reported stress level is ${avgStress}.`,
    `AI live analysis is currently unavailable, so this summary is based on each student's latest saved wellness record.`,
  ].join(' ')
}

export async function analyzeWellnessSentiment(
  rows: WellnessSummaryRow[]
): Promise<string> {
  if (!rows.length) {
    return 'No wellness data available for analysis.'
  }

  const formatted = rows
    .map((r, index) =>
      [
        `Student ${index + 1}: ${r.full_name ?? 'Unknown'}`,
        `Risk: ${r.latest_risk_level ?? 'unknown'}`,
        `Mood: ${r.latest_mood ?? 'not provided'}`,
        `Stress: ${r.latest_stress_level ?? 'not provided'}`,
        `Sleep Hours: ${r.latest_sleep_hours ?? 'not provided'}`,
        `Latest Summary: ${r.latest_ai_summary ?? 'none'}`,
        `Last Submitted: ${r.latest_submitted_at ?? 'unknown'}`,
      ].join('\n')
    )
    .join('\n\n')

  try {
    return await generateGeminiText({
      model: 'gemini-2.5-flash',
      temperature: 0.4,
      systemInstruction:
        'You are analyzing student wellness monitoring data for school administrators. Do not diagnose mental illness. Summarize only observable patterns, risk distribution, and practical school support recommendations.',
      prompt: `Analyze these latest student wellness records and provide:
1. A brief overall wellness summary
2. Key patterns or concerns
3. A short recommendation for teachers/admins

Records:

${formatted}`,
    })
  } catch (error) {
    console.error('Gemini wellness summary error:', error)
    return buildFallbackSummary(rows)
  }
}