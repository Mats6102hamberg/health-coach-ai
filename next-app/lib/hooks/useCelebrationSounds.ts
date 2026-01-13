'use client'

import { useCallback } from 'react'

export type CelebrationType = 
  | 'weight_loss'
  | 'healthy_meal'
  | 'goal_reached'
  | 'streak_milestone'
  | 'water_goal'
  | 'steps_goal'
  | 'workout_complete'
  | 'good_heart_rate'
  | 'good_sleep'

interface CelebrationConfig {
  sound: string
  message: string
  emoji: string
  color: string
}

const CELEBRATIONS: Record<CelebrationType, CelebrationConfig> = {
  weight_loss: {
    sound: 'celebration',
    message: 'Fantastiskt! Du har gått ner i vikt! 🎉',
    emoji: '🎊',
    color: 'from-green-500 to-emerald-500',
  },
  healthy_meal: {
    sound: 'success',
    message: 'Hälsosam mat! Boris är stolt över dig! 🥗',
    emoji: '🌟',
    color: 'from-green-500 to-lime-500',
  },
  goal_reached: {
    sound: 'achievement',
    message: 'Mål uppnått! Du är en stjärna! ⭐',
    emoji: '🏆',
    color: 'from-yellow-500 to-orange-500',
  },
  streak_milestone: {
    sound: 'fanfare',
    message: 'Otrolig streak! Du är på rullande! 🔥',
    emoji: '🔥',
    color: 'from-orange-500 to-red-500',
  },
  water_goal: {
    sound: 'ding',
    message: 'Bra jobbat! Vattenmålet klarat! 💧',
    emoji: '💧',
    color: 'from-cyan-500 to-blue-500',
  },
  steps_goal: {
    sound: 'victory',
    message: 'Wow! Du nådde ditt stegmål! 👟',
    emoji: '🎯',
    color: 'from-blue-500 to-purple-500',
  },
  workout_complete: {
    sound: 'cheer',
    message: 'Träningspass klart! Du är en vinnare! 💪',
    emoji: '💪',
    color: 'from-purple-500 to-pink-500',
  },
  good_heart_rate: {
    sound: 'positive',
    message: 'Perfekt hjärtfrekvens! Bra jobbat! ❤️',
    emoji: '❤️',
    color: 'from-red-500 to-pink-500',
  },
  good_sleep: {
    sound: 'calm',
    message: 'Underbar sömn! Du är utvilad! 😴',
    emoji: '😴',
    color: 'from-indigo-500 to-purple-500',
  },
}

// Web Audio API ljud-generering
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.log('Audio not supported')
  }
}

const playMelody = (notes: Array<{ freq: number; duration: number }>) => {
  let currentTime = 0
  notes.forEach(note => {
    setTimeout(() => playTone(note.freq, note.duration), currentTime)
    currentTime += note.duration * 1000
  })
}

const SOUND_PATTERNS = {
  celebration: () => {
    // Glädjetjut - uppåtgående melodisk sekvens
    playMelody([
      { freq: 523, duration: 0.15 }, // C
      { freq: 659, duration: 0.15 }, // E
      { freq: 784, duration: 0.15 }, // G
      { freq: 1047, duration: 0.3 }, // C (hög)
    ])
  },
  success: () => {
    // Framgångsljud - två glada toner
    playMelody([
      { freq: 659, duration: 0.1 },
      { freq: 784, duration: 0.2 },
    ])
  },
  achievement: () => {
    // Achievement - triumferande sekvens
    playMelody([
      { freq: 523, duration: 0.1 },
      { freq: 659, duration: 0.1 },
      { freq: 784, duration: 0.1 },
      { freq: 1047, duration: 0.15 },
      { freq: 1319, duration: 0.25 },
    ])
  },
  fanfare: () => {
    // Fanfar - majestätisk
    playMelody([
      { freq: 523, duration: 0.2 },
      { freq: 523, duration: 0.2 },
      { freq: 659, duration: 0.2 },
      { freq: 784, duration: 0.4 },
    ])
  },
  ding: () => {
    // Enkelt ding
    playTone(1047, 0.2)
  },
  victory: () => {
    // Segermelodi
    playMelody([
      { freq: 784, duration: 0.15 },
      { freq: 988, duration: 0.15 },
      { freq: 1175, duration: 0.15 },
      { freq: 1568, duration: 0.3 },
    ])
  },
  cheer: () => {
    // Jubel - snabb uppåtgående
    playMelody([
      { freq: 659, duration: 0.08 },
      { freq: 784, duration: 0.08 },
      { freq: 988, duration: 0.08 },
      { freq: 1175, duration: 0.08 },
      { freq: 1568, duration: 0.2 },
    ])
  },
  positive: () => {
    // Positivt ljud
    playMelody([
      { freq: 659, duration: 0.15 },
      { freq: 784, duration: 0.25 },
    ])
  },
  calm: () => {
    // Lugnt, behagligt ljud
    playMelody([
      { freq: 440, duration: 0.3 },
      { freq: 523, duration: 0.3 },
    ])
  },
}

export function useCelebrationSounds() {
  const celebrate = useCallback((type: CelebrationType) => {
    const config = CELEBRATIONS[type]
    
    // Spela ljud
    const soundPattern = SOUND_PATTERNS[config.sound as keyof typeof SOUND_PATTERNS]
    if (soundPattern) {
      soundPattern()
    }

    return config
  }, [])

  const checkWeightLoss = (currentWeight: number, previousWeight?: number) => {
    if (previousWeight && currentWeight < previousWeight) {
      return celebrate('weight_loss')
    }
    return null
  }

  const checkHealthyMeal = (calories: number, protein?: number) => {
    // Hälsosam måltid: låga kalorier (<500) och bra protein (>15g)
    if (calories < 500 && protein && protein > 15) {
      return celebrate('healthy_meal')
    }
    return null
  }

  const checkGoalReached = (progress: number) => {
    if (progress >= 100) {
      return celebrate('goal_reached')
    }
    return null
  }

  const checkStreakMilestone = (streak: number) => {
    // Fira vid milstolpar: 7, 14, 30, 100 dagar
    if ([7, 14, 30, 100].includes(streak)) {
      return celebrate('streak_milestone')
    }
    return null
  }

  const checkGoodHeartRate = (heartRate: number) => {
    // Bra vilopuls: 60-80 BPM
    if (heartRate >= 60 && heartRate <= 80) {
      return celebrate('good_heart_rate')
    }
    return null
  }

  const checkGoodSleep = (sleepHours: number) => {
    // Bra sömn: 7-9 timmar
    if (sleepHours >= 7 && sleepHours <= 9) {
      return celebrate('good_sleep')
    }
    return null
  }

  return {
    celebrate,
    checkWeightLoss,
    checkHealthyMeal,
    checkGoalReached,
    checkStreakMilestone,
    checkGoodHeartRate,
    checkGoodSleep,
  }
}
