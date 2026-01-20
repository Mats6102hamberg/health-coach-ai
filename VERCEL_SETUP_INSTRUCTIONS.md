# Vercel Setup Instructions

## Skapa vercel.json fil

### Steg 1: Skapa ny fil
1. Öppna Command Palette i Cursor:
   - **Mac:** `⌘ + Shift + P`
   - **Windows/Linux:** `Ctrl + Shift + P`

2. Skriv i Command Palette:
   ```
   Cursor: New File
   ```

3. Tryck Enter för att skapa filen

### Steg 2: Namnge filen
- Namnge filen till: `vercel.json`
- Se till att den skapas i **roten** av projektet (samma nivå som `package.json`)

### Steg 3: Klistra in innehåll
Klistra in följande JSON-kod i filen:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Steg 4: Spara filen
- **Mac:** `⌘ + S`
- **Windows/Linux:** `Ctrl + S`

## Vad denna konfiguration gör

### Rewrites-konfiguration:
- ✅ **`"source": "/(.*)"`** - Matchar alla routes
- ✅ **`"destination": "/"`** - Omdirigerar alla till root
- ✅ **Säkerställer SPA-funktionalitet** (Single Page Application)
- ✅ **Hanterar client-side routing** korrekt
- ✅ **Förhindrar 404-fel** vid direktnavigation

## Varför behövs detta?

### För React SPA:
- React Router hanterar routing på client-sidan
- Vercel behöver veta att alla routes ska hanteras av `index.html`
- Utan denna konfiguration får du 404-fel vid direktnavigation

### Exempel på routes som fungerar:
- `/` - Huvudsida
- `/dashboard` - Dashboard
- `/ai-coach` - AI Coach
- `/settings` - Inställningar

## Nästa steg efter att filen är skapad

1. **Commita ändringarna:**
   ```bash
   git add vercel.json
   git commit -m "Add vercel.json configuration for SPA routing"
   ```

2. **Deploya till Vercel:**
   ```bash
   vercel --prod
   ```

3. **Testa att alla routes fungerar** på den deployade URL:en

---

*Skapad för Boris Run-projektet*
