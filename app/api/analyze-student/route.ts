import { createClient } from '@/lib/supabase/server'
import { generateGeminiText } from '@/lib/ai/gemini'

function makeFallbackAnalysis({
  mood,
  stress,
  sleepHours,
  journalText,
}: {
  mood: number
  stress: number
  sleepHours?: number | null
  journalText?: string | null
}) {
  const atRisk = mood <= 2 || stress >= 4
  const riskFactors: string[] = []

  if (mood <= 2) riskFactors.push('Low reported mood')
  if (stress >= 4) riskFactors.push('High reported stress')
  if (sleepHours !== null && sleepHours !== undefined && sleepHours < 6) {
    riskFactors.push('Low sleep hours')
  }
  if (journalText && journalText.trim().length > 0) {
    riskFactors.push('Journal reflection should be reviewed')
  }

  return {
    detectedEmotion: mood <= 2 ? 'Distressed' : mood >= 4 ? 'Happy' : 'Neutral',
    emotionConfidence: 70,
    riskLevel: atRisk ? 'At-Risk' : 'Normal',
    riskFactors,
    academicImpact: atRisk
      ? 'The student may need support because wellness indicators show possible difficulty with focus, motivation, or engagement.'
      : 'No immediate academic concern is indicated by the current wellness data.',
    recommendedActions: atRisk
      ? [
          'Schedule a private check-in with the student.',
          'Ask about current academic and personal stressors.',
          'Document the intervention and monitor the next wellness submission.',
        ]
      : [
          'Continue routine monitoring.',
          'Encourage healthy study and rest habits.',
          'Review the next check-in for changes.',
        ],
    urgency: atRisk ? 'high' : 'low',
    summary: atRisk
      ? 'The student shows wellness indicators that may require timely support. A check-in is recommended.'
      : 'The student appears stable based on the available wellness data. Continue regular monitoring.',
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
      return Response.json({ error: 'Teachers or admins only' }, { status: 403 })
    }

    const body = await request.json()

    const studentName = body.studentName || 'Student'
    const journalText = body.journalText || ''
    const mood = Number(body.mood ?? 3)
    const stress = Number(body.stress ?? 3)
    const sleepHours = body.sleepHours ?? null
    const gwa = body.gwa ?? null

    const fallback = makeFallbackAnalysis({
      mood,
      stress,
      sleepHours,
      journalText,
    })

    const moodLabels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
    const stressLabels = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Very High']

    const prompt = `You are Sentire AI, an emotion-aware academic monitoring assistant for educators.

STUDENT: ${studentName}

WELLNESS DATA:
- Current Mood: ${moodLabels[mood] || 'Unknown'} (${mood}/5)
- Stress Level: ${stressLabels[stress] || 'Unknown'} (${stress}/5)
- Sleep Hours: ${sleepHours ?? 'Not reported'}
- Academic GWA: ${gwa ? Number(gwa).toFixed(2) : 'No data'}

STUDENT'S JOURNAL/REFLECTION:
"${journalText || 'No journal entry provided'}"

Respond in this EXACT JSON format only:
{
  "detectedEmotion": "Thriving | Happy | Neutral | Stressed | Distressed",
  "emotionConfidence": 0,
  "riskLevel": "At-Risk | Normal",
  "riskFactors": ["factor 1", "factor 2"],
  "academicImpact": "brief assessment",
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "urgency": "low | medium | high",
  "summary": "2-3 sentence professional summary for the teacher/admin"
}

Rules:
- At-Risk if mood <= 2 OR stress >= 4 OR the journal strongly suggests distress
- Otherwise Normal
- Be professional, practical, and non-diagnostic.`

    try {
      const text = await generateGeminiText({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        systemInstruction:
          'You are a school wellness analysis assistant. Output valid JSON only. Do not use markdown fences.',
        prompt,
      })

      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const analysis = JSON.parse(cleanText)

      return Response.json({ analysis })
    } catch (geminiError) {
      console.error('Gemini student analysis failed:', geminiError)

      return Response.json({
        analysis: fallback,
        warning: 'Gemini analysis failed. Rule-based fallback analysis was returned.',
      })
    }
  } catch (error) {
    console.error('Student analysis error:', error)
    return Response.json({ error: 'Failed to analyze student data.' }, { status: 500 })
  }
}