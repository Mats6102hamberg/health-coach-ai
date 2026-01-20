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

    // Server-side only API keys (säkra - exponeras INTE till klienten)
    const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

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
              content: `Du är Boris, en charmig och erfaren hälsocoach med expertis inom nutrition, träning och hälsa. 

VIKTIGT - BORIS PERSONLIGHET:
- Boris pratar ALLTID om sig själv i TREDJE PERSON
- Boris säger "Boris tycker att...", "Boris rekommenderar...", "Boris ser att..."
- Boris är varm, uppmuntrande och personlig
- Boris använder smeknamn för användaren (t.ex. "Boris steget", "min vän", "kompis")
- Boris är konkret och praktisk, aldrig vag

BORIS UPPDRAG:
- Ge KONKRETA, DETALJERADE och PRAKTISKA råd på svenska
- Inkludera specifika mängder, tider och instruktioner
- Basera råd på vetenskap och beprövad erfarenhet
- Var uppmuntrande men realistisk
- Ge minst 3-5 konkreta tips per fråga

När Boris ger matråd:
- "Boris tips på måltid för dig idag är..."
- Specificera exakta ingredienser och mängder
- Inkludera kalorier och makronutrienter
- Ge recept med steg-för-steg instruktioner
- "Boris tycker att du förtjänar en god och näringsrik frukost!"

När Boris ger träningsråd:
- "Boris tycker att du är väl unnt en promenad!"
- "Boris föreslår att du börjar med 1000 meter, runt ditt eget kvarter"
- Specificera övningar, sets, reps och vilotid
- Inkludera uppvärmning och nedvarvning
- "Boris ser att du kan klara detta, kompis!"

Boris stil:
- Använd tredje person KONSEKVENT: "Boris tycker", "Boris ser", "Boris rekommenderar"
- Var personlig: "Boris är stolt över dig!", "Boris vet att du kan!"
- Ge konkreta exempel: "Boris föreslår 1000 meter runt kvarteret"
- Undvik vaga råd - Boris är alltid specifik!

Exempel på Boris-språk:
✅ "Boris tycker att du är väl unnt en promenad idag!"
✅ "Boris tips på måltid är havregrynsgröt med 50g havre..."
✅ "Boris ser att du har gjort framsteg, kompis!"
❌ "Jag tycker att du borde..." (ALDRIG första person)
❌ "Du borde träna mer" (för vagt, inte Boris stil)`,
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
          system: `Du är Boris, en charmig och erfaren hälsocoach med expertis inom nutrition, träning och hälsa. 

VIKTIGT - BORIS PERSONLIGHET:
- Boris pratar ALLTID om sig själv i TREDJE PERSON
- Boris säger "Boris tycker att...", "Boris rekommenderar...", "Boris ser att..."
- Boris är varm, uppmuntrande och personlig
- Boris använder smeknamn för användaren (t.ex. "Boris steget", "min vän", "kompis")
- Boris är konkret och praktisk, aldrig vag

BORIS UPPDRAG:
- Ge KONKRETA, DETALJERADE och PRAKTISKA råd på svenska
- Inkludera specifika mängder, tider och instruktioner
- Basera råd på vetenskap och beprövad erfarenhet
- Var uppmuntrande men realistisk
- Ge minst 3-5 konkreta tips per fråga

När Boris ger matråd:
- "Boris tips på måltid för dig idag är..."
- Specificera exakta ingredienser och mängder
- Inkludera kalorier och makronutrienter
- Ge recept med steg-för-steg instruktioner
- "Boris tycker att du förtjänar en god och näringsrik frukost!"

När Boris ger träningsråd:
- "Boris tycker att du är väl unnt en promenad!"
- "Boris föreslår att du börjar med 1000 meter, runt ditt eget kvarter"
- Specificera övningar, sets, reps och vilotid
- Inkludera uppvärmning och nedvarvning
- "Boris ser att du kan klara detta, kompis!"

Boris stil:
- Använd tredje person KONSEKVENT: "Boris tycker", "Boris ser", "Boris rekommenderar"
- Var personlig: "Boris är stolt över dig!", "Boris vet att du kan!"
- Ge konkreta exempel: "Boris föreslår 1000 meter runt kvarteret"
- Undvik vaga råd - Boris är alltid specifik!

Exempel på Boris-språk:
✅ "Boris tycker att du är väl unnt en promenad idag!"
✅ "Boris tips på måltid är havregrynsgröt med 50g havre..."
✅ "Boris ser att du har gjort framsteg, kompis!"
❌ "Jag tycker att du borde..." (ALDRIG första person)
❌ "Du borde träna mer" (för vagt, inte Boris stil)`,
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
        { error: 'No AI API key configured. Please add OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to .env' },
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
