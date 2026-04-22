import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

interface SurveyResponse {
  id: string
  feedback: string
  category: string
  score: number
  submitted_at: string
}

export async function analyzeWellnessSentiment(responses: SurveyResponse[]): Promise<string> {
  if (responses.length === 0) {
    return 'No survey responses available for analysis.'
  }

  const feedbackText = responses
    .map((r) => `[${r.category}] Score: ${r.score}/100 - ${r.feedback || 'No feedback'}`)
    .join('\n')

  try {
    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze the following student wellness survey responses and provide a brief sentiment summary with key insights and recommendations:\n\n${feedbackText}\n\nProvide a 2-3 sentence summary of overall wellness sentiment and any concerning patterns you notice.`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (textContent && textContent.type === 'text') {
      return textContent.text
    }

    return 'Unable to generate analysis.'
  } catch (error) {
    console.error('Groq API error:', error)
    throw new Error('Failed to analyze wellness sentiment')
  }
}

export async function generateMonthlyReport(responses: SurveyResponse[]): Promise<string> {
  if (responses.length === 0) {
    return 'No data available for monthly report.'
  }

  const categoryStats = responses.reduce(
    (acc, r) => {
      if (!acc[r.category]) {
        acc[r.category] = { scores: [], count: 0 }
      }
      acc[r.category].scores.push(r.score)
      acc[r.category].count += 1
      return acc
    },
    {} as Record<string, { scores: number[]; count: number }>
  )

  const summary = Object.entries(categoryStats)
    .map(([category, data]) => {
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count)
      return `${category}: ${avgScore}/100 (${data.count} responses)`
    })
    .join('\n')

  try {
    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `Generate a brief monthly wellness report based on these survey statistics:\n\n${summary}\n\nInclude: 1) Overall wellness trend, 2) Top 2-3 areas of concern, 3) Recommended interventions for each concern area.`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (textContent && textContent.type === 'text') {
      return textContent.text
    }

    return 'Unable to generate report.'
  } catch (error) {
    console.error('Groq API error:', error)
    throw new Error('Failed to generate monthly report')
  }
}
