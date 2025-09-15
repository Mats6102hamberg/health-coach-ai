# 🚀 Distribuera HälsoPartner AI

## Option 1: Netlify (Gratis, 5 min setup)
1. Bygg appen: `npm run build`
2. Gå till [netlify.com](https://netlify.com)
3. Dra `dist`-mappen till Netlify
4. Din app får en URL som: `https://halsopartner-ai.netlify.app`

## Option 2: Vercel (Gratis, GitHub integration)
1. Pusha koden till GitHub
2. Gå till [vercel.com](https://vercel.com)
3. Importera ditt GitHub repo
4. Automatisk deploy på varje commit

## Option 3: GitHub Pages (Gratis)
1. `npm run build`
2. Pusha `dist`-innehållet till GitHub Pages
3. Aktivera Pages i repo settings

## Environment Variables för produktion:
- VITE_OPENAI_API_KEY (din riktiga nyckel)
- VITE_APP_NAME=HälsoPartner AI
- VITE_PREFERRED_AI_PROVIDER=auto

## 📱 Användarinstruktioner:
När appen är online kan vem som helst:
1. Besöka URL:en på sin telefon
2. Installera som PWA från webbläsaren
3. Använda som vanlig app med AI-funktioner
