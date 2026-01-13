import { useState, useEffect } from 'react'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastLogDate: string | null
  xp: number
  level: number
}

export function useStreak(userId?: string) {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    lastLogDate: null,
    xp: 0,
    level: 1,
  })

  useEffect(() => {
    if (!userId) return

    const streakKey = `streak_${userId}`
    const saved = localStorage.getItem(streakKey)
    
    if (saved) {
      setStreak(JSON.parse(saved))
    }
  }, [userId])

  const updateStreak = () => {
    if (!userId) return

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    let newStreak = { ...streak }

    if (streak.lastLogDate === today) {
      return { ...newStreak, isNewLog: false }
    }

    if (streak.lastLogDate === yesterday || !streak.lastLogDate) {
      newStreak.currentStreak += 1
      newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak)
    } else {
      newStreak.currentStreak = 1
    }

    newStreak.totalDays += 1
    newStreak.lastLogDate = today
    newStreak.xp += 10 + (newStreak.currentStreak * 2)
    newStreak.level = Math.floor(newStreak.xp / 100) + 1

    const streakKey = `streak_${userId}`
    localStorage.setItem(streakKey, JSON.stringify(newStreak))
    setStreak(newStreak)

    return { ...newStreak, isNewLog: true }
  }

  const getAchievements = () => {
    const achievements = []
    
    if (streak.currentStreak >= 3) achievements.push({ icon: '🔥', name: '3-dagars streak!', color: 'orange' })
    if (streak.currentStreak >= 7) achievements.push({ icon: '⚡', name: '1 vecka!', color: 'yellow' })
    if (streak.currentStreak >= 14) achievements.push({ icon: '💪', name: '2 veckor!', color: 'blue' })
    if (streak.currentStreak >= 30) achievements.push({ icon: '🏆', name: '1 månad!', color: 'gold' })
    if (streak.currentStreak >= 100) achievements.push({ icon: '👑', name: 'Mästare!', color: 'purple' })
    
    if (streak.totalDays >= 10) achievements.push({ icon: '🎯', name: '10 dagar totalt', color: 'green' })
    if (streak.totalDays >= 50) achievements.push({ icon: '🌟', name: '50 dagar totalt', color: 'green' })
    if (streak.totalDays >= 100) achievements.push({ icon: '💎', name: '100 dagar totalt', color: 'green' })
    
    if (streak.level >= 5) achievements.push({ icon: '📈', name: 'Level 5!', color: 'cyan' })
    if (streak.level >= 10) achievements.push({ icon: '🚀', name: 'Level 10!', color: 'cyan' })

    return achievements
  }

  return {
    streak,
    updateStreak,
    getAchievements,
  }
}
