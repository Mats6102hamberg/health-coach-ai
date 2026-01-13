# HälsoPartner AI

En AI-driven hälsocoach-app som hjälper användare med personlig coaching, viktspårning, aktivitetsloggning och matanalys.

---

## 🚀 Live / Deploy
- Production: Ej deployad ännu (planerad: Vercel)
- Preview/Staging: http://localhost:3000 (lokal dev)
- Repo: /Users/admin/hälsopartner

---

## 🎯 Syfte
Det här projektet bygger:
- ✅ AI-driven hälsocoaching med personliga råd
- ✅ Viktspårning med visualisering och målsättning
- ✅ Aktivitetsspårning (steg, kalorier, träning)
- ✅ Smart matanalys med AI-drivna näringsråd
- ✅ PWA-stöd för mobil installation

---

## 🧭 Projektstatus
**Nuvarande fokus:** Next.js-migrering färdigställd, backend-implementation nästa  
**Stabilitet:** ⚠️ Delvis (frontend fungerar, backend saknas)

---

## 🧠 Dokumentation (Source of Truth)
Det finns tre viktiga filer som ALLTID ska hållas uppdaterade:

- **`/SESSION_SUMMARY.md`**  
  Projektets auktoritativa sanningskälla (tekniska beslut, implementation, nästa steg).

- **`/session_memory.md`**  
  Projektets hjärna (varför + beslut + historik). Får vara lång.

- **`/handover.md`**  
  Snapshot + checklista. Ska vara kort och brutal.

📌 **Regel:**  
Efter varje arbetspass uppdateras `SESSION_SUMMARY.md` och `session_memory.md`.  
Vid paus/fokusbyte även `handover.md`.

---

## 🧰 Tech Stack
- Frontend: Next.js 16 (App Router) + React 19 + TypeScript
- Styling: Tailwind 4 (CSS-baserad konfiguration)
- Visualisering: Recharts
- Ikoner: Lucide React
- Backend/API: Ej implementerat (planerat: Next.js API routes)
- DB: Neon Postgres (planerad)
- ORM: Prisma (planerad)
- Auth: Ej implementerad (planerad: Clerk eller NextAuth.js)
- Hosting: Vercel (planerad)
- PWA: Service Worker + Manifest

---

## 📦 Installation (Local Setup)

### 1) Installera
```bash
cd next-app
npm install
```

### 2) Miljövariabler
Skapa `.env.local` i `next-app/`:
```env
NEXT_PUBLIC_OPENAI_API_KEY="sk-proj-..."
NEXT_PUBLIC_ANTHROPIC_API_KEY="sk-ant-..."
NEXT_PUBLIC_GEMINI_API_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**⚠️ Lägg aldrig hemliga nycklar i repo eller i docs-filer.**

### 3) Starta lokalt
```bash
npm run dev
```

Öppna: http://localhost:3000

---

## 🧪 Test & Verifiering (Quick checks)

### Kritiska flöden att testa
- ✅ Appen laddar på http://localhost:3000
- ✅ AI-coach-sektion visas
- ✅ Viktspårning med graf fungerar
- ✅ Aktivitetsloggning visas
- ✅ Service Worker registreras (kontrollera i DevTools)

### Snabb build-test
```bash
npm run build
```

### TypeScript-verifiering
```bash
npx tsc --noEmit
```

---

## 🗂️ Projektstruktur

```
/Users/admin/hälsopartner/
├── SESSION_SUMMARY.md          # Source of Truth
├── session_memory.md           # Projektets hjärna
├── handover.md                 # Snapshot + checklista
├── README.md                   # Denna fil
├── next-app/                   # Next.js-projekt
│   ├── app/
│   │   ├── layout.tsx          # Root layout med PWA-stöd
│   │   ├── page.tsx            # Huvudkomponent (87k rader)
│   │   └── globals.css         # Tailwind 4 + PWA-anpassningar
│   ├── lib/
│   │   └── services/
│   │       ├── healthAPI.ts    # Health Data API + AI Coach API
│   │       └── notificationService.ts
│   ├── public/
│   │   ├── manifest.json       # PWA-manifest
│   │   ├── sw.js               # Service Worker
│   │   └── *.png               # PWA-ikoner
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   └── postcss.config.mjs
└── src/                        # Gamla Vite-filer (kommer tas bort)
```

---

## 📌 Roadmap

### V1 (MVP)
- ✅ Next.js-migrering färdigställd
- ✅ PWA-stöd implementerat
- ✅ UI med AI-coach, viktspårning, aktivitet
- ⏳ Backend/API med Prisma + Neon Postgres
- ⏳ Autentisering (Clerk eller NextAuth.js)
- ⏳ Deploy till Vercel

### V2+
- Konsolidera AI-funktioner i modulära komponenter
- Real-time notifications
- Automated tester (Playwright/Jest)
- HealthKit/Google Fit-integration

---

## 🔐 Security & Compliance

**GDPR:** Ej implementerat ännu (planerat för backend-fas)  
**Logging policy:** Console-logging i dev, strukturerad logging planerad för production  
**Data retention:** Ej definierat ännu  
**Access control:** Ej implementerat (planerat med auth)

---

## 🆘 Support / Kontakt

**Lead:** Mats Hamberg  
**Projekt:** HälsoPartner AI  
**Repo:** /Users/admin/hälsopartner

Om något är oklart: börja i `/SESSION_SUMMARY.md`
