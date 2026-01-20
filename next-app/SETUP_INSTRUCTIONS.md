# Boris Run - Setup Instruktioner

## ✅ Konfiguration slutförd!

Din `.env.local` fil är nu konfigurerad med alla nödvändiga API-nycklar.

## 🔧 Konfigurerade tjänster

| Tjänst | Status | Beskrivning |
|--------|--------|-------------|
| OpenAI | ✅ Konfigurerad | Boris AI-coach (primär) |
| Anthropic Claude | ✅ Konfigurerad | Backup AI-provider |
| Google Gemini | ✅ Konfigurerad | Alternativ AI-provider |
| Neon PostgreSQL | ✅ Konfigurerad | Databas för användardata |
| Clerk | ✅ Konfigurerad | Autentisering |

## 🚀 Starta appen

```bash
cd ~/hälsopartner/next-app
npm install  # Om det behövs
npm run dev
```

Öppna: http://localhost:3000

## 🧪 Testa Boris AI

1. **Logga in** i appen på `/sign-in`
2. Gå till **Dashboard** (`/app`)
3. Klicka på **"🎩 Boris"** fliken
4. Skriv ett meddelande, t.ex:
   - "Ge mig matråd för idag"
   - "Boris, hur ska jag träna idag?"
   - "Vad tycker Boris om min hälsa?"

### Förväntat svar från Boris

Boris svarar alltid i **tredje person**:

```
Boris tycker att du förtjänar en näringsrik frukost idag, kompis! 🥣

Boris tips på frukost:
- 50g havregryn med 200ml mjölk
- 1 banan, skivad
- 1 msk honung

Detta ger dig cirka 400 kcal och 15g protein!

Boris ser att du är på rätt väg! 💪
```

## 🔐 Säkerhetsinformation

### ⚠️ VIKTIGT - Skydda dina nycklar!

- **DELA ALDRIG** din `.env.local` fil
- **COMMITTA ALDRIG** `.env.local` till Git
- **ROTERA** API-nycklar omedelbart om de exponeras
- **ANVÄND** olika nycklar för utveckling och produktion

### Kontrollera att .env.local är säker

```bash
# Verifiera att filen INTE finns i Git
git ls-files --error-unmatch .env.local  # Ska ge error = bra!

# Kontrollera .gitignore
grep ".env.local" .gitignore  # Ska visa ".env.local"
```

## 📁 Filstruktur

```
next-app/
├── .env.local          # 🔐 DINA lokala hemligheter (INTE i Git)
├── .env.example        # 📄 Mall för nya utvecklare
├── .env.local.example  # 📄 Mall för lokala inställningar
└── .gitignore          # ✅ Blockerar .env.local från Git
```

## 🔄 Uppdatera API-nycklar

Om du behöver byta ut en API-nyckel:

```bash
# Öppna filen
nano .env.local

# Hitta och uppdatera relevant nyckel
# Spara: Ctrl+O, Enter
# Stäng: Ctrl+X

# Starta om appen
npm run dev
```

## 📚 Länkar

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://aistudio.google.com/app/apikey
- **Clerk**: https://dashboard.clerk.com/
- **Neon**: https://neon.tech/docs

## 🐛 Felsökning

### "No AI API key configured"
→ Kontrollera att `OPENAI_API_KEY` finns i `.env.local`

### "Unauthorized" från Clerk
→ Kontrollera `CLERK_SECRET_KEY` och `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Databasfel
→ Kontrollera `DATABASE_URL` och att Neon-databasen är aktiv

### Boris svarar inte
→ Kontrollera att OpenAI-nyckeln är giltig och har credits

---

**Genererat:** 20 januari 2026
