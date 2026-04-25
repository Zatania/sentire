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

    const text = await generateGeminiText({
      model: 'gemini-2.5-flash',
      temperature: 0.5,
      systemInstruction:
        'You are an empathetic AI wellness assistant for university students. Be warm, concise, supportive, and non-diagnostic.',
      prompt: `Based on the student's current emotional state and recent wellness trends, provide:
1. A brief empathetic acknowledgment
2. One specific, actionable recommendation
3. If stress is High or Very High, gently suggest support resources

Current State:
- Mood: ${moodLabels[mood] || 'Unknown'}
- Stress Level: ${stressLabels[stress] || 'Unknown'}

Recent Wellness Trend: ${recentTrend || 'No previous data'}

Write naturally in short paragraphs only, max 100 words.`,
    })

    return Response.json({ insight: text })
  } catch (error) {
    console.error('Wellness insights error:', error)
    return Response.json({ error: 'Failed to generate wellness insights' }, { status: 500 })
  }
}