import { createClient } from '@/lib/supabase/server'
import { generateGeminiText } from '@/lib/ai/gemini'

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
      .single()

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
      return Response.json({ error: 'Teachers or admins only' }, { status: 403 })
    }

    const { studentName, journalText, mood, stress, sleepHours, gwa } = await request.json()

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

    const text = await generateGeminiText({
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      systemInstruction:
        'You are a school wellness analysis assistant. Output valid JSON only. Do not use markdown fences.',
      prompt,
    })

    let analysis
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanText)
    } catch {
      analysis = {
        detectedEmotion: mood <= 2 ? 'Distressed' : mood >= 4 ? 'Happy' : 'Neutral',
        emotionConfidence: 75,
        riskLevel: mood <= 2 || stress >= 4 ? 'At-Risk' : 'Normal',
        riskFactors: stress >= 4 ? ['High stress levels'] : [],
        academicImpact: 'Unable to generate detailed analysis',
        recommendedActions: ['Schedule a check-in with the student'],
        urgency: mood <= 2 || stress >= 4 ? 'high' : 'low',
        summary: text.slice(0, 250),
      }
    }

    return Response.json({ analysis })
  } catch (error) {
    console.error('Student analysis error:', error)
    return Response.json({ error: 'Failed to analyze student data' }, { status: 500 })
  }
}