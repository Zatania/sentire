import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify teacher role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return Response.json({ error: 'Teachers only' }, { status: 403 })
    }

    const { studentName, journalText, mood, stress, sleepHours, gwa } = await request.json()

    const moodLabels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
    const stressLabels = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Very High']

    const prompt = `You are Sentire AI, an emotion-aware academic monitoring assistant for educators. Analyze the following student data and provide a structured assessment.

STUDENT: ${studentName}

WELLNESS DATA:
- Current Mood: ${moodLabels[mood] || 'Unknown'} (${mood}/5)
- Stress Level: ${stressLabels[stress] || 'Unknown'} (${stress}/5)
- Sleep Hours: ${sleepHours ?? 'Not reported'}
- Academic GWA: ${gwa ? gwa.toFixed(2) : 'No data'}

STUDENT'S JOURNAL/REFLECTION:
"${journalText || 'No journal entry provided'}"

Analyze and respond in this EXACT JSON format (no markdown, just raw JSON):
{
  "detectedEmotion": "one of: Thriving, Happy, Neutral, Stressed, Distressed",
  "emotionConfidence": "percentage 0-100",
  "riskLevel": "At-Risk or Normal",
  "riskFactors": ["list", "of", "specific", "factors"],
  "academicImpact": "Brief assessment of how emotional state may affect academics",
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "urgency": "low, medium, or high",
  "summary": "2-3 sentence professional summary for the teacher"
}

Risk Assessment Rules:
- At-Risk: mood <= 2 OR stress >= 4 OR journal mentions concerning keywords (overwhelmed, hopeless, can't cope, failing, giving up)
- Normal: Otherwise

Be clinical and professional in your assessment.`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 500,
    })

    // Parse the JSON response
    let analysis
    try {
      // Clean up potential markdown formatting
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanText)
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        detectedEmotion: mood <= 2 ? 'Distressed' : mood >= 4 ? 'Happy' : 'Neutral',
        emotionConfidence: 75,
        riskLevel: mood <= 2 || stress >= 4 ? 'At-Risk' : 'Normal',
        riskFactors: stress >= 4 ? ['High stress levels'] : [],
        academicImpact: 'Unable to generate detailed analysis',
        recommendedActions: ['Schedule a check-in with the student'],
        urgency: mood <= 2 || stress >= 4 ? 'high' : 'low',
        summary: text.slice(0, 200),
      }
    }

    return Response.json({ analysis })
  } catch (error) {
    console.error('Student analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze student data' },
      { status: 500 }
    )
  }
}
