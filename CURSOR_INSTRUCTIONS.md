# Cursor Editor Instructions

## Skapa ny fil i Cursor

### Metod 1: Command Palette
1. Öppna Command Palette i Cursor:
   - **Mac:** `⌘ + Shift + P`
   - **Windows/Linux:** `Ctrl + Shift + P`

2. Skriv i Command Palette:
   ```
   Cursor: New File
   ```

3. Tryck Enter för att skapa filen

### Metod 2: Snabbkommando
- **Mac:** `⌘ + N`
- **Windows/Linux:** `Ctrl + N`

### Metod 3: Meny
1. Gå till **File** → **New File**
2. Eller högerklicka i Explorer-panelen → **New File**

## Andra användbara Cursor-kommandon

### Command Palette-kommandon:
- `Cursor: New File` - Skapa ny fil
- `Cursor: New Folder` - Skapa ny mapp
- `Cursor: Open File` - Öppna fil
- `Cursor: Save` - Spara fil
- `Cursor: Save All` - Spara alla filer

### Snabbkommandon:
- `⌘ + S` / `Ctrl + S` - Spara
- `⌘ + Shift + S` / `Ctrl + Shift + S` - Spara som
- `⌘ + O` / `Ctrl + O` - Öppna fil
- `⌘ + Shift + O` / `Ctrl + Shift + O` - Öppna mapp

### Git-kommandon:
- `⌘ + Shift + G` / `Ctrl + Shift + G` - Git-panel
- `⌘ + Enter` / `Ctrl + Enter` - Commit
- `⌘ + Shift + P` → `Git: Push` - Pusha till remote

## Tips för HälsoPartner AI-projektet

### När du skapar nya filer:
1. **Components:** Lägg i `src/components/`
2. **Services:** Lägg i `src/services/`
3. **Types:** Lägg i `src/types/`
4. **Utils:** Lägg i `src/utils/`
5. **Docs:** Lägg i roten med `.md`-ändelse

### Filsstruktur:
```
src/
├── components/     # React-komponenter
├── services/       # API och services
├── types/          # TypeScript-typer
├── utils/          # Hjälpfunktioner
├── hooks/          # Custom React hooks
└── assets/         # Bilder och ikoner
```

### Namngivning:
- **Komponenter:** `PascalCase.tsx` (t.ex. `HealthDashboard.tsx`)
- **Services:** `camelCase.ts` (t.ex. `healthAPI.ts`)
- **Types:** `camelCase.ts` (t.ex. `userTypes.ts`)
- **Utils:** `camelCase.ts` (t.ex. `dateUtils.ts`)

---

*Skapad för HälsoPartner AI-projektet*
