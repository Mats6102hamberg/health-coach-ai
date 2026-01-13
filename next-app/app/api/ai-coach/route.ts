import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message, context } = body

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      )
    }

    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const claudeKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    let aiProvider = 'none'
    let aiResponse = ''

    if (openaiKey && openaiKey.startsWith('sk-proj-')) {
      aiProvider = 'openai'
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Du är en erfaren och certifierad hälsocoach med expertis inom nutrition, träning och hälsa. 

DITT UPPDRAG:
- Ge KONKRETA, DETALJERADE och PRAKTISKA råd på svenska
- Inkludera specifika mängder, tider och instruktioner
- Basera råd på vetenskap och beprövad erfarenhet
- Var uppmuntrande men realistisk
- Ge minst 3-5 konkreta tips per fråga

När du ger matråd:
- Specificera exakta ingredienser och mängder
- Inkludera kalorier och makronutrienter
- Ge recept med steg-för-steg instruktioner
- Föreslå alternativ för olika preferenser

När du ger träningsråd:
- Specificera övningar, sets, reps och vilotid
- Inkludera uppvärmning och nedvarvning
- Anpassa intensitet efter användarens nivå
- Ge tips för progression

Var alltid konkret och undvik vaga råd som "ät hälsosamt" eller "träna mer".`,
            },
            {
              role: 'user',
              content: context ? `Kontext: ${JSON.stringify(context)}\n\nFråga: ${message}` : message,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      aiResponse = data.choices[0]?.message?.content || 'Kunde inte generera svar.'
    } else if (claudeKey && claudeKey.startsWith('sk-ant-')) {
      aiProvider = 'claude'
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: `Du är en erfaren och certifierad hälsocoach med expertis inom nutrition, träning och hälsa. 

DITT UPPDRAG:
- Ge KONKRETA, DETALJERADE och PRAKTISKA råd på svenska
- Inkludera specifika mängder, tider och instruktioner
- Basera råd på vetenskap och beprövad erfarenhet
- Var uppmuntrande men realistisk
- Ge minst 3-5 konkreta tips per fråga

När du ger matråd:
- Specificera exakta ingredienser och mängder
- Inkludera kalorier och makronutrienter
- Ge recept med steg-för-steg instruktioner
- Föreslå alternativ för olika preferenser

När du ger träningsråd:
- Specificera övningar, sets, reps och vilotid
- Inkludera uppvärmning och nedvarvning
- Anpassa intensitet efter användarens nivå
- Ge tips för progression

Var alltid konkret och undvik vaga råd som "ät hälsosamt" eller "träna mer".`,
          messages: [
            {
              role: 'user',
              content: context 
                ? `Kontext: ${JSON.stringify(context)}\n\nFråga: ${message}` 
                : message,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      aiResponse = data.content[0]?.text || 'Kunde inte generera svar.'
    } else if (geminiKey) {
      aiProvider = 'gemini'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: context
                      ? `Du är en professionell hälsocoach. Kontext: ${JSON.stringify(context)}\n\nFråga: ${message}`
                      : `Du är en professionell hälsocoach. ${message}`,
                  },
                ],
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Kunde inte generera svar.'
    } else {
      return NextResponse.json(
        { error: 'No AI API key configured. Please add NEXT_PUBLIC_OPENAI_API_KEY, NEXT_PUBLIC_ANTHROPIC_API_KEY, or NEXT_PUBLIC_GEMINI_API_KEY to .env' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      provider: aiProvider,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('POST /api/ai-coach error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
