<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# HälsoPartner AI - Copilot Instructions

Detta är en React TypeScript hälsoapp med AI-funktioner. 

## Projektöversikt
- **Språk**: Svenska (UI och meddelanden)
- **Framework**: React 18 med TypeScript
- **Styling**: Tailwind CSS
- **Grafer**: Recharts
- **Ikoner**: Lucide React
- **Build**: Vite

## Kodstil
- Använd functional components med hooks
- TypeScript för typsäkerhet
- Svenska variabelnamn och kommentarer där det är naturligt
- Responsive design med mobile-first approach
- AI-funktioner ska vara realistiska och användbara

## AI-Funktioner
- Matanalys med betygsättning (excellent, good, moderate, poor)
- Personliga träningsråd baserat på aktivitetsdata
- Motivationsmeddelanden med emoji
- Smarta målsättningar som anpassas efter progress
- Beteendemönsteranalys

## Designprinciper
- Modern och ren UI med gradienter
- Använd färgkodning för olika datatyper:
  - Blå: Vikt/mål
  - Grön: Aktivitet/framsteg
  - Orange: Mat/kalorier
  - Lila: AI/intelligens
- Tydliga visuella feedbacksystem
- Mobilvänlig design (max-w-md)

## Datastruktur
- Viktdata: {date, weight, target}
- Aktivitetsdata: {date, steps, minutes, calories}
- Matlogg: {food, calories, time, aiRating}
- AI-meddelanden: {type, message, timestamp}

När du genererar kod, följ dessa riktlinjer och håll funktionaliteten konsistent med den befintliga designen.
