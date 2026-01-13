'use client'

import { useState } from 'react'
import { Heart, Droplets, Moon, Flame, TrendingUp, Award } from 'lucide-react'

interface HealthDashboardProps {
  goals: {
    dailySteps: number
    dailyCalories: number
    dailyActiveMinutes: number
    dailyWaterGlasses: number
    weeklyWorkouts: number
  }
  progress: {
    steps: number
    calories: number
    activeMinutes: number
    waterGlasses: number
    workoutsThisWeek: number
    heartRate?: number
    sleepHours?: number
  }
  onAddWater: () => void
  onUpdateHeartRate: (hr: number) => void
  onUpdateSleep: (hours: number) => void
}

export function HealthDashboard({ goals, progress, onAddWater, onUpdateHeartRate, onUpdateSleep }: HealthDashboardProps) {
  const [heartRateInput, setHeartRateInput] = useState('')
  const [sleepInput, setSleepInput] = useState('')

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500'
    if (percentage >= 70) return 'from-blue-500 to-cyan-500'
    if (percentage >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  const stepsProgress = Math.min(100, Math.round((progress.steps / goals.dailySteps) * 100))
  const caloriesProgress = Math.min(100, Math.round((progress.calories / goals.dailyCalories) * 100))
  const activeProgress = Math.min(100, Math.round((progress.activeMinutes / goals.dailyActiveMinutes) * 100))
  const waterProgress = Math.min(100, Math.round((progress.waterGlasses / goals.dailyWaterGlasses) * 100))
  const workoutProgress = Math.min(100, Math.round((progress.workoutsThisWeek / goals.weeklyWorkouts) * 100))

  return (
    <div className="space-y-6">
      {/* Main Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Steps Goal */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">👟</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Steg</p>
                <p className="text-2xl font-bold text-gray-800">{progress.steps.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Mål</p>
              <p className="text-lg font-semibold text-gray-700">{goals.dailySteps.toLocaleString()}</p>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(stepsProgress)} transition-all duration-500`}
              style={{ width: `${stepsProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{stepsProgress}% av målet</p>
        </div>

        {/* Calories Goal */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kalorier</p>
                <p className="text-2xl font-bold text-gray-800">{progress.calories}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Mål</p>
              <p className="text-lg font-semibold text-gray-700">{goals.dailyCalories}</p>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(caloriesProgress)} transition-all duration-500`}
              style={{ width: `${caloriesProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{caloriesProgress}% av målet</p>
        </div>

        {/* Active Minutes Goal */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktiva minuter</p>
                <p className="text-2xl font-bold text-gray-800">{progress.activeMinutes}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Mål</p>
              <p className="text-lg font-semibold text-gray-700">{goals.dailyActiveMinutes}</p>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(activeProgress)} transition-all duration-500`}
              style={{ width: `${activeProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{activeProgress}% av målet</p>
        </div>
      </div>

      {/* Secondary Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Intake */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vatten</p>
                <p className="text-2xl font-bold text-gray-800">{progress.waterGlasses} / {goals.dailyWaterGlasses} glas</p>
              </div>
            </div>
            <button
              onClick={onAddWater}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              + Glas
            </button>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(waterProgress)} transition-all duration-500`}
              style={{ width: `${waterProgress}%` }}
            />
          </div>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: goals.dailyWaterGlasses }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-8 rounded ${
                  i < progress.waterGlasses
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Weekly Workouts */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Träningspass (vecka)</p>
                <p className="text-2xl font-bold text-gray-800">{progress.workoutsThisWeek} / {goals.weeklyWorkouts}</p>
              </div>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(workoutProgress)} transition-all duration-500`}
              style={{ width: `${workoutProgress}%` }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            {Array.from({ length: goals.weeklyWorkouts }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center ${
                  i < progress.workoutsThisWeek
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Award size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heart Rate */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hjärtfrekvens</p>
              <p className="text-2xl font-bold text-gray-800">
                {progress.heartRate ? `${progress.heartRate} BPM` : 'Ej mätt'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={heartRateInput}
              onChange={(e) => setHeartRateInput(e.target.value)}
              placeholder="BPM"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                if (heartRateInput) {
                  onUpdateHeartRate(parseInt(heartRateInput))
                  setHeartRateInput('')
                }
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-600"
            >
              Spara
            </button>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Moon className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sömn (senaste natten)</p>
              <p className="text-2xl font-bold text-gray-800">
                {progress.sleepHours ? `${progress.sleepHours}h` : 'Ej loggat'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              value={sleepInput}
              onChange={(e) => setSleepInput(e.target.value)}
              placeholder="Timmar"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                if (sleepInput) {
                  onUpdateSleep(parseFloat(sleepInput))
                  setSleepInput('')
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600"
            >
              Spara
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
