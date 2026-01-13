/**
 * Boris API Client
 * 
 * Unified API client for all backend operations.
 * All requests go through /api/boris with { action, payload }
 */

type ApiResponse<T = any> = 
  | { ok: true; data: T }
  | { ok: false; error: string; code: string }

export class BorisApiError extends Error {
  code: string
  
  constructor(message: string, code: string) {
    super(message)
    this.name = 'BorisApiError'
    this.code = code
  }
}

async function borisRequest<T = any>(
  action: string,
  payload?: any
): Promise<T> {
  try {
    const response = await fetch('/api/boris', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    })

    const result: ApiResponse<T> = await response.json()

    if (!result.ok) {
      throw new BorisApiError(result.error, result.code)
    }

    return result.data
  } catch (error) {
    if (error instanceof BorisApiError) {
      throw error
    }
    
    // Network or parsing error
    throw new BorisApiError(
      error instanceof Error ? error.message : 'Unknown error',
      'NETWORK_ERROR'
    )
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const borisApi = {
  /**
   * Health check (public, no auth required)
   */
  health: () => borisRequest<{ status: string; service: string; timestamp: number; version: string }>('health'),

  /**
   * Profile operations
   */
  profile: {
    get: () => borisRequest<{ id: string; email: string; name: string | null; createdAt: Date; updatedAt: Date }>('profile.get'),
    
    upsert: (data: { nickname?: string; goalFocus?: string }) => 
      borisRequest('profile.upsert', data),
  },

  /**
   * Onboarding
   */
  onboarding: {
    complete: () => borisRequest<{ onboarded: boolean }>('onboarding.complete'),
  },

  /**
   * Daily logs
   */
  dailyLog: {
    upsert: (data: {
      date: string // YYYY-MM-DD
      steps?: number
      waterMl?: number
      sleepMinutes?: number
      heartRateAvg?: number
    }) => borisRequest('dailyLog.upsert', data),

    getRange: (from: string, to: string) => 
      borisRequest<any[]>('dailyLog.getRange', { from, to }),
  },

  /**
   * Dashboard
   */
  dashboard: {
    get: () => borisRequest<{
      today: {
        steps: number
        calories: number
        activity: any
      }
      weight: any
      meals: any[]
      streak: {
        current: number
        best: number
        lastActive: string
      }
    }>('dashboard.get'),
  },

  /**
   * Achievements
   */
  achievement: {
    list: () => borisRequest<Array<{ key: string; unlockedAt: Date }>>('achievement.list'),
  },

  /**
   * Streak
   */
  streak: {
    get: () => borisRequest<{
      currentStreak: number
      bestStreak: number
      lastActiveDate: string | null
    }>('streak.get'),
  },

  /**
   * Weekly summary
   */
  weeklySummary: {
    get: (weekStartDate: string) => 
      borisRequest<{
        weekStart: string
        weekEnd: string
        summary: {
          totalSteps: number
          totalCalories: number
          avgSteps: number
          activeDays: number
          weightLogs: number
          mealLogs: number
        }
        activities: any[]
        weights: any[]
        meals: any[]
      }>('weeklySummary.get', { weekStartDate }),
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * Get date range for current week
 */
export function getCurrentWeek(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Health check (public)
const health = await borisApi.health()
console.log(health.status) // "ok"

// Get profile
const profile = await borisApi.profile.get()
console.log(profile.email)

// Update profile
await borisApi.profile.upsert({
  nickname: 'Boris steget',
  goalFocus: 'weight_loss'
})

// Complete onboarding
await borisApi.onboarding.complete()

// Log today's data
await borisApi.dailyLog.upsert({
  date: getToday(),
  steps: 10000,
  waterMl: 2000,
  sleepMinutes: 480,
  heartRateAvg: 72
})

// Get logs for date range
const logs = await borisApi.dailyLog.getRange('2026-01-01', '2026-01-31')

// Get dashboard
const dashboard = await borisApi.dashboard.get()
console.log(dashboard.today.steps)
console.log(dashboard.streak.current)

// Get achievements
const achievements = await borisApi.achievement.list()

// Get streak
const streak = await borisApi.streak.get()
console.log(streak.currentStreak)

// Get weekly summary
const week = getCurrentWeek()
const summary = await borisApi.weeklySummary.get(week.start)
console.log(summary.summary.totalSteps)

// Error handling
try {
  await borisApi.profile.get()
} catch (error) {
  if (error instanceof BorisApiError) {
    console.error(`Error ${error.code}: ${error.message}`)
  }
}

*/
