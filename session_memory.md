# session_memory.md

## Projekt
- Namn: Parviz Skrivrum
- Repo/Path: /Users/admin/hälsopartner
- Startdatum: 2026-01-12
- Senast uppdaterad: 2026-01-13

---

## Kort sammanfattning (max 10 rader)
En React/Tailwind-baserad hälsoapp ("HälsoPartner AI") med AI-coaching, vikt- och aktivitetsanalys samt Recharts-visualisering. Just nu pågår migrering från Vite till Next.js 14 (App Router) med Tailwind 4, PWA-stöd och kommande Prisma/Neon-backend, samtidigt som dokumentation och processer hålls uppdaterade.

---

## Senaste sessionen (2026-01-13 - Förmiddag)
### Vad vi gjorde
- [x] Implementerade DailyLog-modell i Prisma schema (DateTime för date-fält)
- [x] Tog bort User-relation från DailyLog (Clerk-kompatibel, endast userId string)
- [x] Körde Prisma-migrationer (add_daily_log, remove_user_relation)
- [x] Uppdaterade Boris API för att använda DailyLog-modellen
- [x] Implementerade robust date handling (dayKeyToUTCDate helper)
- [x] Fixade textsynlighet i Boris textarea (text-gray-900)
- [x] Implementerade röstinput för Boris (useSpeechRecognition hook)
- [x] Lade till mikrofon-knapp med visuell feedback (pulserar när lyssnar)
- [x] Skapade CODEMAP.md - komplett projektöversikt på svenska
- [x] Pushade alla ändringar till GitHub

### Beslut (varför vi valde X)
- Beslut: DailyLog utan User-relation (endast userId string)
  - Orsak: Clerk används för auth, ingen Prisma User-tabell som matchar Clerk
  - userId är en string från Clerk, inte en Prisma-relation
  - Alternativ som avfärdades: Prisma User-relation (fungerar inte med Clerk)

- Beslut: DateTime istället för String för date-fält
  - Orsak: Bättre datatyp, enklare queries, timezone-hantering
  - Implementerade dayKeyToUTCDate helper för robust date conversion
  - Alternativ som avfärdades: String-datum (svårare att hantera, timezone-problem)

- Beslut: Web Speech API för röstinput
  - Orsak: Native browser API, fungerar utan externa dependencies
  - Svenska språket (sv-SE) stöds
  - Alternativ som avfärdades: Externa speech-to-text API:er (kostnad, komplexitet)

- Beslut: Unified Boris API endpoint (/api/boris)
  - Orsak: Vercel Hobby-plan har begränsat antal serverless functions
  - En endpoint med action router istället för många endpoints
  - Enklare att underhålla och dokumentera

### Problem vi såg
- ✅ User-relation i DailyLog → Fixat genom att ta bort relation och köra migration
- ✅ Text i Boris textarea knappt synlig → Fixat med text-gray-900
- ✅ TypeScript-fel i useSpeechRecognition → Fixat genom att korrigera interface-typer
- ⚠️ IDE visar Prisma-fel tills Prisma Client genereras om (normalt beteende)

### Lärdomar
- Clerk och Prisma User-relationer fungerar inte tillsammans - använd endast userId string
- Prisma-migrationer måste köras för att ta bort foreign keys från databasen
- Web Speech API fungerar utmärkt för svenska röstinput
- Visuell feedback (pulsering, färgändringar) är viktig för röstinput UX
- CODEMAP.md är ovärderlig för att förstå projektstruktur

---

## Pågående arbete (Work in progress)
- Nu har vi: Komplett hälsoapp med Boris AI, röstinput, streak-system, stepmätare, hälsomål
- Nästa tekniska del: Clerk authentication för Vercel-deployment
- Risk/Osäkerhet: AI-nycklar behöver konfigureras för produktion, Clerk setup krävs

---

## Idéer och framtida funktioner (Backlog)
- Implementera Clerk authentication för produktion
- Konfigurera AI-nycklar för Vercel deployment
- Lägg till smeknamn i Boris personlighet
- Fler achievements och streak-milstolpar
- Veckosammanfattningar från Boris
- Push-notifikationer för dagliga påminnelser
- Dela framsteg på sociala medier

---

## Viktiga länkar
- Figma: Ej dokumenterat
- Deployment: Ej dokumenterat (Vercel planerad)
- Docs: README.md (rot)
- Issues: Ej dokumenterat

✅ Den här filen får vara lång.
✅ Den här filen är din “hjärna på papper”.
