# HälsoPartner AI

En intelligent hälso- och fitnessapp med AI-funktioner för personlig coaching.

## Funktioner

🧠 **AI-Coaching**: Personliga råd baserat på dina data och beteendemönster
📊 **Viktspårning**: Visualisering av viktprogress med målsättning
🏃‍♀️ **Aktivitetsspårning**: Steg, kalorier och träningsanalys
🍎 **Smart matanalys**: AI-drivna näringsråd och hälsosamma substitut
📈 **Datavisualisering**: Interaktiva grafer och trender
🎯 **Smarta mål**: AI-genererade mål baserat på din progress

## Teknologi

- **React 18** med TypeScript
- **Tailwind CSS** för modern styling
- **Recharts** för datavisualisering
- **Lucide React** för ikoner
- **Vite** för snabb utveckling

## Kom igång

1. Installera dependencies:
```bash
npm install
```

2. Starta utvecklingsservern:
```bash
npm run dev
```

3. Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare

## AI-Funktioner

### Personlig Coaching
- Analyserar dina beteendemönster
- Ger skräddarsydda tränings- och näringsråd
- Motiverande meddelanden baserat på din progress

### Smart Matanalys
- Betygsätter mat och ger alternativ
- Föreslår hälsosamma substitut
- Spårar näringsprofiler

### Intelligenta Mål
- Anpassar mål baserat på din prestanda
- Realistiska och uppnåeliga målsättningar
- Kontinuerlig optimering

## Utveckling

```bash
# Utveckling
npm run dev

# Bygga för produktion
npm run build

# Förhandsgranska build
npm run preview

# Linting
npm run lint
```

## Struktur

```
src/
├── App.tsx          # Huvudkomponent med alla funktioner
├── main.tsx         # Applikationens startpunkt
└── index.css        # Tailwind CSS imports
```

Appen är byggd som en enda komponent för enkelhetens skull men kan lätt delas upp i mindre komponenter för större projekt.
