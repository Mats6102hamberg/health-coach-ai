'use client'

import { useState, useEffect } from 'react'

interface HealthGoals {
  dailySteps: number
  dailyCalories: number
  dailyActiveMinutes: number
  dailyWaterGlasses: number
  weeklyWorkouts: number
}

interface HealthProgress {
  steps: number
  calories: number
  activeMinutes: number
  waterGlasses: number
  workoutsThisWeek: number
  heartRate?: number
  sleepHours?: number
}

const DEFAULT_GOALS: HealthGoals = {
  dailySteps: 10000,
  dailyCalories: 2000,
  dailyActiveMinutes: 30,
  dailyWaterGlasses: 8,
  weeklyWorkouts: 3,
}

export function useHealthGoals(userId?: string) {
  const [goals, setGoals] = useState<HealthGoals>(DEFAULT_GOALS)
  const [progress, setProgress] = useState<HealthProgress>({
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    waterGlasses: 0,
    workoutsThisWeek: 0,
  })

  useEffect(() => {
    if (!userId) return

    const savedGoals = localStorage.getItem(`healthGoals_${userId}`)
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }

    const today = new Date().toDateString()
    const savedProgress = localStorage.getItem(`healthProgress_${userId}_${today}`)
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [userId])

  const updateGoals = (newGoals: Partial<HealthGoals>) => {
    const updated = { ...goals, ...newGoals }
    setGoals(updated)
    if (userId) {
      localStorage.setItem(`healthGoals_${userId}`, JSON.stringify(updated))
    }
  }

  const updateProgress = (newProgress: Partial<HealthProgress>) => {
    const updated = { ...progress, ...newProgress }
    setProgress(updated)
    if (userId) {
      const today = new Date().toDateString()
      localStorage.setItem(`healthProgress_${userId}_${today}`, JSON.stringify(updated))
    }
  }

  const addWater = () => {
    updateProgress({ waterGlasses: progress.waterGlasses + 1 })
  }

  const addWorkout = () => {
    updateProgress({ workoutsThisWeek: progress.workoutsThisWeek + 1 })
  }

  const updateHeartRate = (heartRate: number) => {
    updateProgress({ heartRate })
  }

  const updateSleep = (sleepHours: number) => {
    updateProgress({ sleepHours })
  }

  const getGoalProgress = (type: keyof HealthGoals): number => {
    const goalValue = goals[type]
    let progressValue = 0

    switch (type) {
      case 'dailySteps':
        progressValue = progress.steps
        break
      case 'dailyCalories':
        progressValue = progress.calories
        break
      case 'dailyActiveMinutes':
        progressValue = progress.activeMinutes
        break
      case 'dailyWaterGlasses':
        progressValue = progress.waterGlasses
        break
      case 'weeklyWorkouts':
        progressValue = progress.workoutsThisWeek
        break
    }

    return Math.min(100, Math.round((progressValue / goalValue) * 100))
  }

  const isGoalReached = (type: keyof HealthGoals): boolean => {
    return getGoalProgress(type) >= 100
  }

  return {
    goals,
    progress,
    updateGoals,
    updateProgress,
    addWater,
    addWorkout,
    updateHeartRate,
    updateSleep,
    getGoalProgress,
    isGoalReached,
  }
}
