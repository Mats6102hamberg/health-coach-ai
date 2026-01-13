# Boris API Testing Guide

## Overview
All backend operations go through a single unified endpoint: `/api/boris`

## Endpoint
- **URL:** `POST /api/boris`
- **Format:** `{ action: string, payload?: any }`
- **Auth:** Clerk (required for all actions except `health`)

---

## Available Actions

### 1. Health Check (Public)
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -d '{"action":"health"}'
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "service": "Boris API",
    "timestamp": 1736754000000,
    "version": "1.0.0"
  }
}
```

---

### 2. Get Profile
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"action":"profile.get"}'
```

---

### 3. Update Profile
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "action": "profile.upsert",
    "payload": {
      "nickname": "Boris steget",
      "goalFocus": "weight_loss"
    }
  }'
```

---

### 4. Complete Onboarding
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"action":"onboarding.complete"}'
```

---

### 5. Log Daily Data
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "action": "dailyLog.upsert",
    "payload": {
      "date": "2026-01-13",
      "steps": 10000,
      "waterMl": 2000,
      "sleepMinutes": 480,
      "heartRateAvg": 72
    }
  }'
```

---

### 6. Get Daily Logs (Range)
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "action": "dailyLog.getRange",
    "payload": {
      "from": "2026-01-01",
      "to": "2026-01-31"
    }
  }'
```

---

### 7. Get Dashboard
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"action":"dashboard.get"}'
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "today": {
      "steps": 10000,
      "calories": 400,
      "activity": {...}
    },
    "weight": {...},
    "meals": [...],
    "streak": {
      "current": 7,
      "best": 14,
      "lastActive": "2026-01-13T00:00:00.000Z"
    }
  }
}
```

---

### 8. List Achievements
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"action":"achievement.list"}'
```

---

### 9. Get Streak
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"action":"streak.get"}'
```

---

### 10. Get Weekly Summary
```bash
curl -X POST http://localhost:3000/api/boris \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "action": "weeklySummary.get",
    "payload": {
      "weekStartDate": "2026-01-06"
    }
  }'
```

---

## Client Usage (TypeScript)

```typescript
import { borisApi, getToday, getCurrentWeek } from '@/lib/borisApi'

// Health check (no auth)
const health = await borisApi.health()

// Get profile
const profile = await borisApi.profile.get()

// Update profile
await borisApi.profile.upsert({
  nickname: 'Boris steget',
  goalFocus: 'weight_loss'
})

// Log today's data
await borisApi.dailyLog.upsert({
  date: getToday(),
  steps: 10000,
  waterMl: 2000,
  sleepMinutes: 480,
  heartRateAvg: 72
})

// Get dashboard
const dashboard = await borisApi.dashboard.get()
console.log(dashboard.today.steps)

// Get weekly summary
const week = getCurrentWeek()
const summary = await borisApi.weeklySummary.get(week.start)
```

---

## Error Handling

All errors follow this format:
```json
{
  "ok": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `UNAUTHORIZED` - Not logged in
- `VALIDATION_ERROR` - Invalid payload
- `UNKNOWN_ACTION` - Action not found
- `PROFILE_NOT_FOUND` - User profile doesn't exist
- `INTERNAL_ERROR` - Server error

**Client Error Handling:**
```typescript
import { borisApi, BorisApiError } from '@/lib/borisApi'

try {
  await borisApi.profile.get()
} catch (error) {
  if (error instanceof BorisApiError) {
    console.error(`Error ${error.code}: ${error.message}`)
    
    if (error.code === 'UNAUTHORIZED') {
      // Redirect to login
    }
  }
}
```

---

## TODO: Prisma Schema Updates

Add these models to your `prisma/schema.prisma`:

```prisma
model DailyLog {
  id            String   @id @default(cuid())
  userId        String
  date          String
  steps         Int?
  waterMl       Int?
  sleepMinutes  Int?
  heartRateAvg  Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
}

model AchievementEvent {
  id          String   @id @default(cuid())
  userId      String
  key         String
  unlockedAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model StreakState {
  userId         String   @id
  currentStreak  Int      @default(0)
  bestStreak     Int      @default(0)
  lastActiveDate String?
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Then run:
```bash
npx prisma migrate dev --name add_boris_models
npx prisma generate
```

---

## Benefits

✅ **Single endpoint** - Stays under Vercel Hobby function limit  
✅ **Type-safe** - Full TypeScript support  
✅ **Validated** - Zod schemas for all payloads  
✅ **Authenticated** - Clerk auth on all protected routes  
✅ **User-scoped** - All data filtered by userId  
✅ **Error handling** - Consistent error format  
✅ **Easy to extend** - Add new actions to the router  

---

## Next Steps

1. Set up Clerk authentication in your Next.js app
2. Update Prisma schema with new models
3. Run migrations
4. Test the health endpoint
5. Integrate borisApi in your components
