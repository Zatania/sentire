type GeminiPart = {
  text: string
}

type GeminiContent = {
  role?: 'user' | 'model'
  parts: GeminiPart[]
}

type GenerateGeminiTextOptions = {
  model?: string
  systemInstruction?: string
  prompt: string
  temperature?: number
}

export async function generateGeminiText({
  model = 'gemini-2.5-flash',
  systemInstruction,
  prompt,
  temperature = 0.4,
}: GenerateGeminiTextOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const body: Record<string, unknown> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      } satisfies GeminiContent,
    ],
    generationConfig: {
      temperature,
    },
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${text}`)
  }

  const data = await response.json()

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('')
      .trim() ?? ''

  if (!text) {
    throw new Error('Gemini returned an empty response')
  }

  return text
}