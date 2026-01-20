# 🤖 Boris Run - Setup Guide

## Aktivera riktig AI i din hälsoapp

För närvarande kör appen i **demo-läge** med simulerade AI-svar. För att få riktiga, personliga hälsoråd från AI-providers behöver du följa dessa steg:

### 🔧 Snabb Setup (5 minuter)

#### Alternativ 1: OpenAI GPT-4 (Rekommenderat)
1. **Skaffa OpenAI API-nyckel**
   - Gå till [platform.openai.com](https://platform.openai.com/)
   - Skapa konto eller logga in
   - Navigera till "API Keys" i sidomenyn
   - Klicka "Create new secret key"
   - Kopiera nyckeln (du ser den bara en gång!)

2. **Konfigurera din app**
   - Öppna filen `.env` i projektets rotmapp
   - Hitta raden: `VITE_OPENAI_API_KEY=your_openai_api_key_here`
   - Ersätt `your_openai_api_key_here` med din riktiga API-nyckel
   - Spara filen

#### Alternativ 2: Google Gemini (Gratis)
1. **Skaffa Gemini API-nyckel**
   - Gå till [makersuite.google.com](https://makersuite.google.com/)
   - Skapa konto eller logga in
   - Navigera till "Get API Key"
   - Klicka "Create API Key"
   - Kopiera nyckeln

2. **Konfigurera din app**
   - Öppna filen `.env` i projektets rotmapp
   - Lägg till: `VITE_GEMINI_API_KEY=din_gemini_api_key_här`
   - Spara filen

#### Alternativ 3: Anthropic Claude
1. **Skaffa Claude API-nyckel**
   - Gå till [console.anthropic.com](https://console.anthropic.com/)
   - Skapa konto eller logga in
   - Navigera till "API Keys"
   - Klicka "Create Key"
   - Kopiera nyckeln

2. **Konfigurera din app**
   - Öppna filen `.env` i projektets rotmapp
   - Lägg till: `VITE_ANTHROPIC_API_KEY=din_claude_api_key_här`
   - Spara filen

3. **Starta om appen**
   ```bash
   npm run dev
   ```

### 💰 Kostnad
- **GPT-4o-mini**: ~$0.001 per AI-interaktion (mycket billigt!)
- **Google Gemini**: GRATIS! (perfekt för att komma igång)
- **Claude-3-haiku**: Backup om OpenAI inte fungerar
- **Uppskattning**: $0-5/månad för normal användning (beroende på provider)

### 🔒 Säkerhet
- API-nyckeln lagras bara lokalt på din enhet
- Ingen data skickas till externa servrar utom vald AI-provider
- All hälsodata förblir privat

### ✅ Bekräfta att det fungerar
När AI är aktiverat ser du:
- ✅ "Riktig AI aktiverad!" i AI Coach-fliken
- Personliga, kontextuella råd baserat på din data
- Intelligenta målrekommendationer
- Motivationsmeddelanden som känns riktiga
- **Nya funktioner:**
  - 🍽️ AI-Måltidsplan (7 dagar)
  - 💪 AI-Träningsplan (4 veckor)
  - 🔮 AI-Hälsoprognos (30 dagar)
  - 💬 AI-Chat för interaktiv coaching

### 🆘 Felsökning
- **"Demo mode"** visas fortfarande → Kontrollera att .env-filen sparats och appen startats om
- **"API Error"** → Kontrollera att API-nyckeln är korrekt kopierad
- **Inga råd visas** → Öppna Developer Tools (F12) och kolla konsolen för fel

---
**Lycka till med din AI-drivna hälsoresa! 🚀💪**
