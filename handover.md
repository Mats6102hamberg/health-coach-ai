# handover.md

## 1) Målbild (Definition of Done)
Appen är klar när:

- [ ] Dashboard visar användarens AI-coachning, vikt, aktivitet och matanalys med live-data
- [ ] Backend/API kopplad till Neon Postgres hanterar användare, loggar och analyser
- [ ] Deployment på Vercel med fungerande AI-nycklar och miljövariabler

---

## 2) Nuläget (State of the Union)
### Fungerar
- ✅ Next.js 16 + React 19 + Tailwind 4 komplett hälsoapp
- ✅ Boris AI-coach med OpenAI/Claude/Gemini integration
- ✅ Röstinput till Boris (Web Speech API, svenska)
- ✅ Streak-system med XP, nivåer och achievements
- ✅ Stepmätare med Web Motion API
- ✅ Hälsomål (steg, vatten, kalorier, aktiva minuter, träning, hjärtfrekvens, sömn)
- ✅ Konfetti-animation och glädjetjut vid framsteg
- ✅ Recharts-grafer för viktprogress och aktivteter
- ✅ Prisma + Neon Postgres backend (DailyLog, WeightLog, ActivityLog, MealLog, Alert)
- ✅ Boris API unified endpoint (/api/boris) med 10 actions
- ✅ PWA-stöd (service worker + manifest)
- ✅ CODEMAP.md - komplett projektöversikt på svenska
- ✅ Lokalt fungerar perfekt på http://localhost:3000

### Delvis klart
- ⚠️ AI-integrationer (fungerar lokalt, behöver konfigureras för Vercel)
- ⚠️ Clerk authentication (backend förberett, frontend setup saknas)

### Saknas
- ❌ Clerk frontend setup för Vercel-deployment
- ❌ AI-nycklar konfigurerade i Vercel
- ❌ Automated tester
- ❌ Vercel deployment med auth

---

## 3) Tekniska nycklar (Stack & Setup)
### Stack
- Frontend: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 + Recharts
- Backend: Next.js API routes ✅ (/api/boris, /api/ai-coach, /api/weight, /api/activity, /api/meals)
- Databas: Neon Postgres ✅ (PostgreSQL)
- ORM: Prisma ✅ (DailyLog, WeightLog, ActivityLog, MealLog, Alert, User)
- Auth: Clerk (backend förberett ✅, frontend setup saknas ❌)
- AI: OpenAI GPT-4 + Anthropic Claude + Google Gemini ✅
- Röstinput: Web Speech API ✅ (svenska)
- Stepmätare: Web Motion API ✅
- Ljud: Web Audio API ✅
- Hosting/Deploy: Vercel (lokalt fungerar ✅, production deployment saknas ❌)
- PWA: Service Worker + Manifest ✅

### Lokalt (hur man kör projektet)
1. `cd next-app`
2. `npm install`
3. `npm run dev`
4. Öppna: http://localhost:3000

### Miljövariabler som krävs
**Lokalt (.env):**
- `DATABASE_URL` - Neon Postgres connection string ✅
- `OPENAI_API_KEY` - OpenAI GPT-4 ✅
- `ANTHROPIC_API_KEY` - Claude ✅
- `GOOGLE_API_KEY` - Gemini ✅

**Vercel (production):**
- `DATABASE_URL` - Neon Postgres ❌
- `OPENAI_API_KEY` ❌
- `ANTHROPIC_API_KEY` ❌
- `GOOGLE_API_KEY` ❌
- `CLERK_SECRET_KEY` ❌
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ❌

> OBS: skriv aldrig in hemliga nycklar i denna fil.

---

## 4) "Sista milen"-checklista
- [x] Skapa SESSION_SUMMARY.md med aktuell status
- [x] Färdigställ Next.js-migrering (ESLint, Tailwind 4, PWA)
- [x] Implementera backend/API + Prisma mot Neon
- [x] Implementera Boris AI med röstinput
- [x] Implementera streak-system med gamification
- [x] Implementera stepmätare och hälsomål
- [x] Skapa CODEMAP.md med projektöversikt
- [ ] Implementera Clerk authentication (frontend)
- [ ] Konfigurera miljövariabler i Vercel
- [ ] Deploy till Vercel med auth
- [ ] Testa production deployment

---

## 5) Kända risker / beslut
- Risk: Clerk frontend setup saknas → Vercel deployment fungerar inte med auth
- Risk: AI-nycklar behöver konfigureras i Vercel → Boris fungerar inte i production
- Risk: Service Worker cache-strategi kan cacha gamla versioner
- Beslut: DailyLog utan User-relation (Clerk-kompatibel)
- Beslut: Unified Boris API endpoint (/api/boris) för Vercel Hobby-plan
- Beslut: Web Speech API för röstinput (native, gratis, svenska)
- Beslut: DateTime istället för String för date-fält (robust date handling)
- Beslut: Använd Tailwind 4 CSS-baserad config (ingen JS-config)
- Tekniskt skuld: Ingen Clerk frontend setup, inga automated tester

**Estimat nästa steg:**
- Clerk frontend setup: 1-2 timmar
- Vercel miljövariabler: 30 min
- Vercel deployment + test: 1 timme

**Kontaktperson:** Mats Hamberg  
**SLA/Deadlines:** Ej definierat

✅ Den här ska vara kort och brutal i tydlighet.
✅ Den ska alltid gå att skicka till någon utomstående.
