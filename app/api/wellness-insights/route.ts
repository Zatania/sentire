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

    const { mood, stress, recentLogs } = await request.json()

    const moodLabels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
    const stressLabels = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Very High']

    const recentTrend = recentLogs
      ?.slice(0, 5)
      .map(
        (log: { mood: number; stress: number }) =>
          `Mood: ${moodLabels[log.mood]}, Stress: ${stressLabels[log.stress]}`
      )
      .join('; ')

    const prompt = `You are Sentire, an empathetic AI wellness assistant for university students. Based on the student's current emotional state and recent wellness trends, provide a brief, supportive, and actionable response.

Current State:
- Mood: ${moodLabels[mood] || 'Unknown'}
- Stress Level: ${stressLabels[stress] || 'Unknown'}

Recent Wellness Trend (last 5 check-ins): ${recentTrend || 'No previous data'}

Provide:
1. A brief empathetic acknowledgment (1 sentence)
2. One specific, actionable wellness recommendation based on their state
3. If stress is High or Very High, gently suggest seeking support resources

Keep the response warm, concise (max 100 words), and student-friendly. Do not use bullet points or numbered lists in your response - write in natural paragraphs.`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 200,
    })

    return Response.json({ insight: text })
  } catch (error) {
    console.error('Wellness insights error:', error)
    return Response.json(
      { error: 'Failed to generate wellness insights' },
      { status: 500 }
    )
  }
}
