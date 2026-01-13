# 🗺️ HälsoPartner - Kodkarta

En komplett översikt över projektets struktur och arkitektur.

---

## 📁 Projektstruktur

```
hälsopartner/
├── next-app/                    # Next.js applikation
│   ├── app/                     # App Router (Next.js 16)
│   │   ├── page.tsx            # 🏠 Huvudkomponent (Dashboard, Boris, Hälsa, etc.)
│   │   ├── layout.tsx          # Layout wrapper
│   │   ├── globals.css         # Globala stilar
│   │   └── api/                # API Routes
│   │       ├── boris/          # 🎩 Unified Boris API
│   │       │   └── route.ts    # POST endpoint för alla Boris-actions
│   │       ├── ai-coach/       # 🤖 AI Coach (OpenAI, Claude, Gemini)
│   │       │   └── route.ts    # POST endpoint för AI-konversationer
│   │       ├── users/          # 👤 Användarhantering
│   │       ├── weight/         # ⚖️ Viktloggning
│   │       ├── activity/       # 🏃 Aktivitetsloggning
│   │       ├── meals/          # 🍎 Måltidsloggning
│   │       └── alerts/         # 🔔 Notifikationer
│   │
│   ├── components/             # React-komponenter
│   │   ├── Confetti.tsx        # 🎊 Konfetti-animation vid framsteg
│   │   ├── SuccessToast.tsx    # ✅ Toast-meddelanden med streak/XP
│   │   └── HealthDashboard.tsx # 📊 Hälsomål-dashboard (Google Fit-stil)
│   │
│   ├── lib/                    # Bibliotek och utilities
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useUser.ts              # 👤 Användardata (SWR)
│   │   │   ├── useWeight.ts            # ⚖️ Viktdata (SWR)
│   │   │   ├── useActivity.ts          # 🏃 Aktivitetsdata (SWR)
│   │   │   ├── useMeal.ts              # 🍎 Måltidsdata (SWR)
│   │   │   ├── useAICoach.ts           # 🤖 AI Coach integration
│   │   │   ├── useStreak.ts            # 🔥 Streak-system, XP, achievements
│   │   │   ├── useStepCounter.ts       # 👟 Stepmätare (Web Motion API)
│   │   │   ├── useHealthGoals.ts       # 🎯 Dagliga/veckovisa hälsomål
│   │   │   ├── useCelebrationSounds.ts # 🎵 Ljudfeedback (Web Audio API)
│   │   │   └── useSpeechRecognition.ts # 🎤 Röstinput (Web Speech API)
│   │   │
│   │   ├── borisApi.ts         # 🎩 Boris API client helper
│   │   └── prisma.ts           # 🗄️ Prisma singleton
│   │
│   ├── prisma/                 # Databas
│   │   ├── schema.prisma       # 📋 Databasschema (PostgreSQL/Neon)
│   │   └── migrations/         # 🔄 Databasmigrationer
│   │
│   ├── public/                 # Statiska filer
│   ├── package.json            # NPM-beroenden
│   ├── tsconfig.json           # TypeScript-konfiguration
│   ├── tailwind.config.ts      # TailwindCSS-konfiguration
│   └── next.config.js          # Next.js-konfiguration
│
├── AI_SETUP_GUIDE.md           # 📖 Guide för AI-konfiguration
├── BORIS_API_TESTING.md        # 🧪 Boris API testdokumentation
├── CURSOR_INSTRUCTIONS.md      # 📝 Instruktioner för Cursor/Cascade
└── README.md                   # 📚 Projektdokumentation
```

---

## 🎯 Huvudkomponenter

### **1. app/page.tsx** - Huvudapplikationen
**Ansvar:** Huvudkomponent som renderar hela appen

**Funktioner:**
- 📊 Dashboard med grafer (vikt, aktivitet)
- ⚖️ Viktloggning med BMI-beräkning
- 🏃 Aktivitetsloggning med stegräkning
- 🍎 Måltidsloggning med kalorier
- 🎩 Boris AI-coach med röstinput
- 👟 Stepmätare med dagliga mål
- ❤️ Hälsomål (steg, vatten, hjärtfrekvens, sömn)

**Hooks som används:**
- `useUser` - Användardata
- `useWeightLogs` - Viktdata
- `useActivityLogs` - Aktivitetsdata
- `useMealLogs` - Måltidsdata
- `useAICoach` - AI-konversationer
- `useStreak` - Streak-system
- `useStepCounter` - Stepmätare
- `useHealthGoals` - Hälsomål
- `useCelebrationSounds` - Ljudfeedback
- `useSpeechRecognition` - Röstinput

**State:**
- `currentTab` - Aktiv flik (dashboard, health, weight, activity, food, ai)
- `weight`, `bodyFat`, `muscle` - Viktformulär
- `activityType`, `activitySteps` - Aktivitetsformulär
- `foodName`, `calories` - Måltidsformulär
- `aiMessage`, `aiResponse` - AI-konversation
- `showConfetti`, `showToast` - Gamification-feedback

---

### **2. app/api/boris/route.ts** - Unified Boris API
**Ansvar:** Single endpoint för alla backend-operationer

**Actions:**
1. `health` - Health check (public)
2. `profile.get` - Hämta användarprofil
3. `profile.upsert` - Skapa/uppdatera profil
4. `onboarding.complete` - Slutför onboarding
5. `dailyLog.upsert` - Logga daglig data (steg, vatten, sömn, hjärtfrekvens)
6. `dailyLog.getRange` - Hämta loggar för datumintervall
7. `dashboard.get` - Hämta dashboard-data
8. `achievement.list` - Lista achievements
9. `streak.get` - Hämta streak-data
10. `weeklySummary.get` - Hämta veckosammanfattning

**Teknologi:**
- Clerk authentication (`auth()`)
- Zod validation
- Prisma ORM
- PostgreSQL (Neon)

**Response format:**
```typescript
{ ok: true, data: any } | { ok: false, error: string, code: string }
```

---

### **3. app/api/ai-coach/route.ts** - AI Coach
**Ansvar:** AI-konversationer med Boris

**AI-providers:**
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini

**Boris personlighet:**
- Pratar alltid i tredje person
- Ger konkreta, personliga råd
- Använder smeknamn
- Motiverande och uppmuntrande

**System prompt:**
```
Boris är din AI-coach som alltid pratar i tredje person.
Boris ger konkreta råd baserat på din hälsodata.
Boris tycker att du är väldigt duktig och uppmuntrar dig.
```

---

## 🎣 Custom Hooks

### **useStreak.ts** - Streak-system
**Funktioner:**
- 🔥 Daglig streak-räkning
- ⭐ XP-system (100 XP per dag)
- 🏆 Achievements (3, 7, 14, 30, 100 dagar)
- 📈 Nivåsystem (Level 1-10+)

**State:**
```typescript
{
  streak: number,
  xp: number,
  level: number,
  achievements: Achievement[]
}
```

---

### **useSpeechRecognition.ts** - Röstinput
**Funktioner:**
- 🎤 Web Speech API integration
- 🇸🇪 Svenska språket (sv-SE)
- 📝 Real-time transkribering
- 👁️ Interim results (live text)

**State:**
```typescript
{
  isListening: boolean,
  transcript: string,
  interimTranscript: string,
  isSupported: boolean,
  error: string | null
}
```

**Metoder:**
- `startListening()` - Börja lyssna
- `stopListening()` - Sluta lyssna
- `resetTranscript()` - Rensa text

---

### **useStepCounter.ts** - Stepmätare
**Funktioner:**
- 👟 Web Motion API (accelerometer)
- 📊 Steg, distans, kalorier, aktiva minuter
- 💾 localStorage för persistens
- 🎯 Dagliga mål

**State:**
```typescript
{
  steps: number,
  distance: number,
  calories: number,
  activeMinutes: number
}
```

---

### **useHealthGoals.ts** - Hälsomål
**Funktioner:**
- 🎯 Dagliga mål (steg, vatten, kalorier, aktiva minuter)
- 📅 Veckovisa mål (träningspass, hjärtfrekvens, sömn)
- 📈 Progress tracking (0-100%)
- 💾 localStorage för persistens

**Goals:**
```typescript
{
  dailySteps: 10000,
  dailyWater: 2000,
  dailyCalories: 2000,
  dailyActiveMinutes: 30,
  weeklyWorkouts: 3,
  targetHeartRate: 70,
  targetSleep: 8
}
```

---

### **useCelebrationSounds.ts** - Ljudfeedback
**Funktioner:**
- 🎵 Web Audio API för ljud
- 🎊 Glädjetjut vid framsteg
- 🏆 Olika ljud för olika achievements

**Events:**
- `weight_loss` - Viktminskning
- `healthy_meal` - Hälsosam måltid
- `steps_goal` - Stegmål uppnått
- `streak_milestone` - Streak-milstolpe
- `good_heart_rate` - Bra hjärtfrekvens
- `good_sleep` - Bra sömn

---

## 🗄️ Databas (Prisma)

### **Schema:**

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  weightLogs   WeightLog[]
  activityLogs ActivityLog[]
  mealLogs     MealLog[]
  alerts       Alert[]
}

model DailyLog {
  id           String   @id @default(cuid())
  userId       String
  date         DateTime
  steps        Int      @default(0)
  waterMl      Int      @default(0)
  sleepMinutes Int?
  heartRateAvg Int?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([userId, date])
  @@index([userId])
}

model WeightLog {
  id        String   @id @default(cuid())
  userId    String
  weight    Float
  bodyFat   Float?
  muscle    Float?
  notes     String?
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}

model ActivityLog {
  id           String   @id @default(cuid())
  userId       String
  type         String
  steps        Int?
  activityDate DateTime
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([activityDate])
}

model MealLog {
  id        String   @id @default(cuid())
  userId    String
  name      String
  calories  Int
  mealDate  DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([mealDate])
}

model Alert {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  severity  String   @default("info")
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@index([isRead])
}
```

**Database:** PostgreSQL (Neon)  
**ORM:** Prisma  
**Migrations:** `prisma/migrations/`

---

## 🎨 UI-komponenter

### **Confetti.tsx**
**Ansvar:** Konfetti-animation vid framsteg

**Props:**
- `show: boolean` - Visa/dölj konfetti
- `onComplete: () => void` - Callback när animation är klar

**Animation:**
- 50 konfetti-partiklar
- Slumpmässiga färger
- Fallande animation med rotation
- 3 sekunders duration

---

### **SuccessToast.tsx**
**Ansvar:** Toast-meddelanden med streak och XP

**Props:**
- `show: boolean` - Visa/dölj toast
- `message: string` - Meddelande
- `streak?: number` - Streak-antal
- `xp?: number` - XP-poäng
- `icon?: string` - Emoji-ikon
- `onClose: () => void` - Callback vid stängning

**Features:**
- Slide-in animation från höger
- Auto-close efter 5 sekunder
- Stängningsknapp
- Streak och XP-display

---

### **HealthDashboard.tsx**
**Ansvar:** Hälsomål-dashboard (Google Fit-inspirerad)

**Props:**
- `goals: Goals` - Dagliga/veckovisa mål
- `progress: Progress` - Aktuellt framsteg
- `onGoalReached: (type: string) => void` - Callback vid mål uppnått

**Widgets:**
- 👟 Steg (dagligt mål)
- 🔥 Kalorier (dagligt mål)
- ⏱️ Aktiva minuter (dagligt mål)
- 💧 Vatten (dagligt mål)
- 🏋️ Träningspass (veckovist mål)
- ❤️ Hjärtfrekvens (genomsnitt)
- 😴 Sömn (timmar)

**UI:**
- Cirkulära progress-indikatorer
- Färgkodade mål (grön = uppnått)
- Responsiv grid-layout
- Animerade övergångar

---

## 🔄 Dataflöde

### **1. Viktloggning:**
```
User input (page.tsx)
  ↓
handleAddWeight()
  ↓
addWeightLog() API call
  ↓
POST /api/weight
  ↓
Prisma: weightLog.create()
  ↓
SWR: mutateWeight() (revalidate)
  ↓
UI update + Confetti + Toast
```

### **2. Boris AI-konversation:**
```
User input (page.tsx) eller Röstinput (useSpeechRecognition)
  ↓
handleAskAI()
  ↓
askAI() API call
  ↓
POST /api/ai-coach
  ↓
OpenAI/Claude/Gemini API
  ↓
Boris response (tredje person)
  ↓
UI update med svar
```

### **3. Streak-uppdatering:**
```
User logs data (weight/activity/meal)
  ↓
updateStreak() (useStreak)
  ↓
Check last log date
  ↓
Increment streak if consecutive day
  ↓
Add XP (100 per day)
  ↓
Check achievements (3, 7, 14, 30, 100 days)
  ↓
Trigger Confetti + Toast + Sound
```

### **4. Röstinput till Boris:**
```
User clicks "🎤 Prata"
  ↓
startListening() (useSpeechRecognition)
  ↓
Web Speech API starts
  ↓
Real-time transcription
  ↓
transcript → aiMessage (useEffect)
  ↓
User clicks "Fråga Boris"
  ↓
handleAskAI() → Boris response
```

---

## 🔐 Autentisering

**Planerad:** Clerk authentication  
**Status:** Backend förberett, frontend pending

**Boris API:**
- ✅ Clerk `auth()` integration
- ✅ User-scoped queries (`userId`)
- ✅ Public endpoints (`health`)
- ⏳ Frontend Clerk setup

---

## 🚀 Deployment

**Development:** `http://localhost:3000`  
**Production:** `parviz-skrivrum.vercel.app` (Vercel)

**Environment variables:**
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

---

## 📦 Dependencies

**Core:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS

**Data:**
- Prisma (ORM)
- SWR (data fetching)
- Zod (validation)

**UI:**
- Recharts (grafer)
- Lucide React (ikoner)

**AI:**
- OpenAI SDK
- Anthropic SDK
- Google Generative AI

**Auth:**
- Clerk (planerad)

---

## 🎯 Features

### **Implementerade:**
- ✅ Viktloggning med BMI
- ✅ Aktivitetsloggning med steg
- ✅ Måltidsloggning med kalorier
- ✅ Boris AI-coach (tredje person)
- ✅ Röstinput till Boris
- ✅ Streak-system med XP och achievements
- ✅ Stepmätare (Web Motion API)
- ✅ Hälsomål (Google Fit-stil)
- ✅ Konfetti-animation
- ✅ Toast-meddelanden
- ✅ Ljudfeedback (glädjetjut)
- ✅ Boris API (unified endpoint)
- ✅ DailyLog-modell (Prisma)

### **Planerade:**
- ⏳ Clerk authentication
- ⏳ Vercel deployment med auth
- ⏳ Smeknamn i Boris
- ⏳ Fler achievements
- ⏳ Veckosammanfattningar
- ⏳ Notifikationer

---

## 📚 Dokumentation

- `README.md` - Projektöversikt
- `AI_SETUP_GUIDE.md` - AI-konfiguration
- `BORIS_API_TESTING.md` - API-testning
- `CURSOR_INSTRUCTIONS.md` - Utvecklingsinstruktioner
- `CODEMAP.md` - Denna fil

---

## 🎉 Sammanfattning

HälsoPartner är en modern hälsoapp byggd med Next.js 16, React 19, och TypeScript. Appen kombinerar traditionell hälsotracking (vikt, aktivitet, mat) med gamification (streak, XP, achievements) och AI-coaching (Boris). Användare kan prata med Boris via röstinput, spåra dagliga hälsomål, och få visuell feedback (konfetti, toast, ljud) vid framsteg.

**Teknisk stack:**
- Frontend: Next.js 16 + React 19 + TailwindCSS
- Backend: Next.js API Routes + Prisma + PostgreSQL
- AI: OpenAI + Claude + Gemini
- Auth: Clerk (planerad)
- Deployment: Vercel

**Unika features:**
- 🎤 Röstinput till AI-coach
- 🎩 Boris pratar i tredje person
- 🔥 Streak-system med gamification
- 🎊 Konfetti och glädjetjut vid framsteg
- 👟 Stepmätare med Web Motion API
- 📊 Google Fit-inspirerad hälsodashboard

---

**Skapad:** 2026-01-13  
**Version:** 1.0  
**Utvecklare:** Mats Hamberg (med hjälp av Cascade AI)
