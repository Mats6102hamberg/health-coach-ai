import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

const ActionSchema = z.object({
  action: z.string(),
  payload: z.any().optional(),
})

type ApiResponse<T = any> = 
  | { ok: true; data: T }
  | { ok: false; error: string; code: string }

// ============================================================================
// ACTION HANDLERS
// ============================================================================

// PUBLIC: Health check
async function handleHealth(): Promise<ApiResponse> {
  return {
    ok: true,
    data: {
      status: 'ok',
      service: 'Boris API',
      timestamp: Date.now(),
      version: '1.0.0',
    },
  }
}

// PROTECTED: Get user profile
async function handleProfileGet(userId: string): Promise<ApiResponse> {
  try {
    // TODO: Adjust if your Prisma model is named differently
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!profile) {
      return { ok: false, error: 'Profile not found', code: 'PROFILE_NOT_FOUND' }
    }

    return { ok: true, data: profile }
  } catch (error) {
    console.error('handleProfileGet error:', error)
    return { ok: false, error: 'Failed to fetch profile', code: 'PROFILE_FETCH_ERROR' }
  }
}

// PROTECTED: Upsert user profile
async function handleProfileUpsert(userId: string, payload: any): Promise<ApiResponse> {
  const schema = z.object({
    nickname: z.string().optional(),
    goalFocus: z.string().optional(),
  })

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload', code: 'VALIDATION_ERROR' }
  }

  try {
    // TODO: Adjust if your User model has different fields
    const profile = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.nickname,
        // TODO: Add goalFocus field to User model if needed
        updatedAt: new Date(),
      },
    })

    return { ok: true, data: profile }
  } catch (error) {
    console.error('handleProfileUpsert error:', error)
    return { ok: false, error: 'Failed to update profile', code: 'PROFILE_UPDATE_ERROR' }
  }
}

// PROTECTED: Complete onboarding
async function handleOnboardingComplete(userId: string): Promise<ApiResponse> {
  try {
    // TODO: Add onboardedAt field to User model
    const profile = await prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
        // onboardedAt: new Date(), // TODO: Uncomment when field exists
      },
    })

    return { ok: true, data: { onboarded: true, profile } }
  } catch (error) {
    console.error('handleOnboardingComplete error:', error)
    return { ok: false, error: 'Failed to complete onboarding', code: 'ONBOARDING_ERROR' }
  }
}

// PROTECTED: Upsert daily log
async function handleDailyLogUpsert(userId: string, payload: any): Promise<ApiResponse> {
  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    steps: z.number().int().min(0).optional(),
    waterMl: z.number().int().min(0).optional(),
    sleepMinutes: z.number().int().min(0).optional(),
    heartRateAvg: z.number().int().min(0).optional(),
  })

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload', code: 'VALIDATION_ERROR' }
  }

  try {
    const date = new Date(parsed.data.date)
    date.setHours(0, 0, 0, 0) // Normalize to start of day

    const log = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        steps: parsed.data.steps ?? undefined,
        waterMl: parsed.data.waterMl ?? undefined,
        sleepMinutes: parsed.data.sleepMinutes ?? undefined,
        heartRateAvg: parsed.data.heartRateAvg ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        date,
        steps: parsed.data.steps ?? 0,
        waterMl: parsed.data.waterMl ?? 0,
        sleepMinutes: parsed.data.sleepMinutes,
        heartRateAvg: parsed.data.heartRateAvg,
      },
    })

    return { ok: true, data: log }
  } catch (error) {
    console.error('handleDailyLogUpsert error:', error)
    return { ok: false, error: 'Failed to save daily log', code: 'DAILY_LOG_ERROR' }
  }
}

// PROTECTED: Get daily logs in range
async function handleDailyLogGetRange(userId: string, payload: any): Promise<ApiResponse> {
  const schema = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload', code: 'VALIDATION_ERROR' }
  }

  try {
    const fromDate = new Date(parsed.data.from)
    fromDate.setHours(0, 0, 0, 0)
    
    const toDate = new Date(parsed.data.to)
    toDate.setHours(23, 59, 59, 999)

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: 'desc' },
    })

    return { ok: true, data: logs }
  } catch (error) {
    console.error('handleDailyLogGetRange error:', error)
    return { ok: false, error: 'Failed to fetch logs', code: 'LOGS_FETCH_ERROR' }
  }
}

// PROTECTED: Get dashboard data
async function handleDashboardGet(userId: string): Promise<ApiResponse> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's activity
    const todayActivity = await prisma.activityLog.findFirst({
      where: {
        userId,
        activityDate: {
          gte: today,
        },
      },
    })

    // Get recent weight
    const recentWeight = await prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Get recent meals
    const recentMeals = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { mealDate: 'desc' },
      take: 5,
    })

    // Calculate streak (simplified - use localStorage on client for now)
    const streak = {
      current: 0,
      best: 0,
      lastActive: today.toISOString(),
    }

    return {
      ok: true,
      data: {
        today: {
          steps: todayActivity?.steps || 0,
          calories: todayActivity?.calories || 0,
          activity: todayActivity,
        },
        weight: recentWeight,
        meals: recentMeals,
        streak,
      },
    }
  } catch (error) {
    console.error('handleDashboardGet error:', error)
    return { ok: false, error: 'Failed to fetch dashboard', code: 'DASHBOARD_ERROR' }
  }
}

// PROTECTED: List achievements
async function handleAchievementList(userId: string): Promise<ApiResponse> {
  try {
    // TODO: Create AchievementEvent model in Prisma schema:
    // model AchievementEvent {
    //   id          String   @id @default(cuid())
    //   userId      String
    //   key         String
    //   unlockedAt  DateTime @default(now())
    //   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    // }

    // For now, return mock achievements based on user data
    const activityCount = await prisma.activityLog.count({ where: { userId } })
    const weightCount = await prisma.weightLog.count({ where: { userId } })
    const mealCount = await prisma.mealLog.count({ where: { userId } })

    const achievements = []
    if (activityCount >= 1) achievements.push({ key: 'first_activity', unlockedAt: new Date() })
    if (activityCount >= 10) achievements.push({ key: '10_activities', unlockedAt: new Date() })
    if (weightCount >= 1) achievements.push({ key: 'first_weight', unlockedAt: new Date() })
    if (mealCount >= 1) achievements.push({ key: 'first_meal', unlockedAt: new Date() })

    return { ok: true, data: achievements }
  } catch (error) {
    console.error('handleAchievementList error:', error)
    return { ok: false, error: 'Failed to fetch achievements', code: 'ACHIEVEMENT_ERROR' }
  }
}

// PROTECTED: Get streak
async function handleStreakGet(userId: string): Promise<ApiResponse> {
  try {
    // TODO: Create StreakState model in Prisma schema:
    // model StreakState {
    //   userId         String   @id
    //   currentStreak  Int      @default(0)
    //   bestStreak     Int      @default(0)
    //   lastActiveDate String?
    //   user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    // }

    // For now, calculate from activity logs
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { activityDate: 'desc' },
      take: 100,
    })

    let currentStreak = 0
    let bestStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Simple streak calculation
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].activityDate)
      logDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      expectedDate.setHours(0, 0, 0, 0)

      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++
      } else {
        break
      }
    }

    bestStreak = Math.max(currentStreak, bestStreak)

    return {
      ok: true,
      data: {
        currentStreak,
        bestStreak,
        lastActiveDate: logs[0]?.activityDate.toISOString() || null,
      },
    }
  } catch (error) {
    console.error('handleStreakGet error:', error)
    return { ok: false, error: 'Failed to fetch streak', code: 'STREAK_ERROR' }
  }
}

// PROTECTED: Get weekly summary
async function handleWeeklySummaryGet(userId: string, payload: any): Promise<ApiResponse> {
  const schema = z.object({
    weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid payload', code: 'VALIDATION_ERROR' }
  }

  try {
    const weekStart = new Date(parsed.data.weekStartDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        activityDate: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      orderBy: { activityDate: 'asc' },
    })

    const weights = await prisma.weightLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        mealDate: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      orderBy: { mealDate: 'asc' },
    })

    const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0)
    const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0)
    const avgSteps = activities.length > 0 ? Math.round(totalSteps / activities.length) : 0

    return {
      ok: true,
      data: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        summary: {
          totalSteps,
          totalCalories,
          avgSteps,
          activeDays: activities.length,
          weightLogs: weights.length,
          mealLogs: meals.length,
        },
        activities,
        weights,
        meals,
      },
    }
  } catch (error) {
    console.error('handleWeeklySummaryGet error:', error)
    return { ok: false, error: 'Failed to fetch weekly summary', code: 'WEEKLY_SUMMARY_ERROR' }
  }
}

// ============================================================================
// ACTION ROUTER
// ============================================================================

const actionHandlers: Record<string, (userId: string, payload?: any) => Promise<ApiResponse>> = {
  'profile.get': handleProfileGet,
  'profile.upsert': handleProfileUpsert,
  'onboarding.complete': handleOnboardingComplete,
  'dailyLog.upsert': handleDailyLogUpsert,
  'dailyLog.getRange': handleDailyLogGetRange,
  'dashboard.get': handleDashboardGet,
  'achievement.list': handleAchievementList,
  'streak.get': handleStreakGet,
  'weeklySummary.get': handleWeeklySummaryGet,
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Boris API - Use POST with { action, payload }',
    availableActions: [
      'health (public)',
      'profile.get',
      'profile.upsert',
      'onboarding.complete',
      'dailyLog.upsert',
      'dailyLog.getRange',
      'dashboard.get',
      'achievement.list',
      'streak.get',
      'weeklySummary.get',
    ],
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request format', code: 'INVALID_FORMAT' },
        { status: 400 }
      )
    }

    const { action, payload } = parsed.data

    // Public action: health check
    if (action === 'health') {
      const result = await handleHealth()
      return NextResponse.json(result)
    }

    // All other actions require authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Route to appropriate handler
    const handler = actionHandlers[action]

    if (!handler) {
      return NextResponse.json(
        { ok: false, error: `Unknown action: ${action}`, code: 'UNKNOWN_ACTION' },
        { status: 400 }
      )
    }

    const result = await handler(userId, payload)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Boris API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
