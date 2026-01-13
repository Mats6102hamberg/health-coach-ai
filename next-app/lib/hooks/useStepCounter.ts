'use client'

import { useState, useEffect } from 'react'

interface StepData {
  steps: number
  distance: number
  calories: number
  activeMinutes: number
  lastUpdated: Date
}

export function useStepCounter() {
  const [stepData, setStepData] = useState<StepData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    lastUpdated: new Date(),
  })
  const [isTracking, setIsTracking] = useState(false)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  useEffect(() => {
    const today = new Date().toDateString()
    const savedData = localStorage.getItem(`stepData_${today}`)
    
    if (savedData) {
      setStepData(JSON.parse(savedData))
    }
  }, [])

  const requestPermission = async () => {
    if ('Accelerometer' in window && 'Gyroscope' in window) {
      try {
        await navigator.permissions.query({ name: 'accelerometer' as PermissionName })
        await navigator.permissions.query({ name: 'gyroscope' as PermissionName })
        setPermission('granted')
        return true
      } catch (error) {
        console.log('Motion sensors not available, using manual input')
        setPermission('denied')
        return false
      }
    } else {
      setPermission('denied')
      return false
    }
  }

  const startTracking = async () => {
    const hasPermission = await requestPermission()
    
    if (hasPermission) {
      setIsTracking(true)
    } else {
      setIsTracking(false)
    }
  }

  const stopTracking = () => {
    setIsTracking(false)
  }

  const addSteps = (steps: number) => {
    const newStepData = {
      steps: stepData.steps + steps,
      distance: stepData.distance + (steps * 0.0008),
      calories: stepData.calories + (steps * 0.04),
      activeMinutes: stepData.activeMinutes + Math.floor(steps / 100),
      lastUpdated: new Date(),
    }
    
    setStepData(newStepData)
    
    const today = new Date().toDateString()
    localStorage.setItem(`stepData_${today}`, JSON.stringify(newStepData))
  }

  const resetDaily = () => {
    const newData = {
      steps: 0,
      distance: 0,
      calories: 0,
      activeMinutes: 0,
      lastUpdated: new Date(),
    }
    setStepData(newData)
    
    const today = new Date().toDateString()
    localStorage.setItem(`stepData_${today}`, JSON.stringify(newData))
  }

  return {
    stepData,
    isTracking,
    permission,
    startTracking,
    stopTracking,
    addSteps,
    resetDaily,
  }
}
