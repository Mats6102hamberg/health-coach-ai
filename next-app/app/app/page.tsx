'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, Activity, Apple, MessageCircle, Plus, Loader2, Heart, Mic, MicOff } from 'lucide-react';
import { useUser as useClerkUser, UserButton } from '@clerk/nextjs';
import { useWeightLogs, addWeightLog } from '@/lib/hooks/useWeight';
import { useActivityLogs, addActivityLog } from '@/lib/hooks/useActivity';
import { useMealLogs, addMealLog } from '@/lib/hooks/useMeal';
import { useAICoach } from '@/lib/hooks/useAICoach';
import { useStreak } from '@/lib/hooks/useStreak';
import { useStepCounter } from '@/lib/hooks/useStepCounter';
import { useHealthGoals } from '@/lib/hooks/useHealthGoals';
import { useCelebrationSounds } from '@/lib/hooks/useCelebrationSounds';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import { Confetti } from '@/components/Confetti';
import { SuccessToast } from '@/components/SuccessToast';
import { HealthDashboard } from '@/components/HealthDashboard';

export default function HealthApp() {
  const { user, isLoaded } = useClerkUser();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Form states
  const [weightInput, setWeightInput] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activitySteps, setActivitySteps] = useState('');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  // Gamification states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIcon, setToastIcon] = useState('✅');
  const [earnedXP, setEarnedXP] = useState(0);

  // Get userId from Clerk
  const userId = user?.id || null;

  // API hooks
  const { weightLogs, isLoading: weightLoading, mutate: mutateWeight } = useWeightLogs(userId || undefined);
  const { activityLogs, isLoading: activityLoading, mutate: mutateActivity } = useActivityLogs(userId || undefined);
  const { mealLogs, isLoading: mealLoading, mutate: mutateMeal } = useMealLogs(userId || undefined);
  const { askAI, isLoading: aiLoading } = useAICoach();
  const { streak, updateStreak, getAchievements } = useStreak(userId || undefined);
  
  // Health tracking hooks
  const { stepData, isTracking, startTracking, stopTracking, addSteps } = useStepCounter();
  const { goals, progress, updateProgress, addWater, addWorkout, updateHeartRate, updateSleep } = useHealthGoals(userId || undefined);
  const { celebrate, checkWeightLoss, checkHealthyMeal, checkGoalReached, checkStreakMilestone, checkGoodHeartRate, checkGoodSleep } = useCelebrationSounds();
  
  // Speech recognition for Boris
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  // Show message if not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Välkommen till HälsoPartner AI</h1>
          <p className="text-gray-600 mb-6">Logga in för att komma åt din hälsodata</p>
        </div>
      </div>
    );
  }

  // Sync step data with health progress
  useEffect(() => {
    if (stepData.steps > 0) {
      updateProgress({
        steps: stepData.steps,
        calories: stepData.calories,
        activeMinutes: stepData.activeMinutes,
      });
      
      // Check if steps goal reached
      const stepsProgress = Math.round((stepData.steps / goals.dailySteps) * 100);
      if (stepsProgress >= 100 && stepData.steps >= goals.dailySteps) {
        const celebration = celebrate('steps_goal');
        if (celebration) {
          setShowConfetti(true);
          setToastMessage(celebration.message);
          setToastIcon(celebration.emoji);
          setShowToast(true);
        }
      }
    }
  }, [stepData]);

  // Sync speech recognition transcript with AI message
  useEffect(() => {
    if (transcript) {
      setAiMessage(transcript);
    }
  }, [transcript]);

  // Prepare chart data
  const weightChartData = weightLogs.map((log: any) => ({
    date: new Date(log.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
    weight: log.weight,
    target: 80,
  }));

  const activityChartData = activityLogs.map((log: any) => ({
    date: new Date(log.activityDate).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
    steps: log.steps || 0,
    calories: log.calories || 0,
  }));

  // Handlers
  const handleAddWeight = async () => {
    if (!userId || !weightInput) return;
    
    const previousWeight = weightLogs.length > 0 ? weightLogs[0].weight : undefined;
    const currentWeight = parseFloat(weightInput);
    
    await addWeightLog(userId, currentWeight);
    setWeightInput('');
    mutateWeight();
    
    // Check for weight loss celebration
    const celebration = checkWeightLoss(currentWeight, previousWeight);
    if (celebration) {
      setShowConfetti(true);
      setToastMessage(celebration.message);
      setToastIcon(celebration.emoji);
      setShowToast(true);
    }
    
    const streakData = updateStreak();
    if (streakData?.isNewLog) {
      if (!celebration) {
        setShowConfetti(true);
        setToastMessage('Vikt loggad!');
        setToastIcon('⚖️');
      }
      setEarnedXP(10 + (streakData.currentStreak * 2));
      setShowToast(true);
      
      // Check streak milestone
      checkStreakMilestone(streakData.currentStreak);
    }
  };

  const handleAddActivity = async () => {
    if (!userId || !activityType || !activitySteps) return;
    await addActivityLog(userId, activityType, parseInt(activitySteps));
    setActivityType('');
    setActivitySteps('');
    mutateActivity();
    
    const streakData = updateStreak();
    if (streakData?.isNewLog) {
      setShowConfetti(true);
      setToastMessage('Aktivitet loggad!');
      setToastIcon('🏃');
      setEarnedXP(10 + (streakData.currentStreak * 2));
      setShowToast(true);
    }
  };

  const handleAddMeal = async () => {
    if (!userId || !foodName || !foodCalories) return;
    
    const calories = parseInt(foodCalories);
    await addMealLog(userId, 'Måltid', foodName, calories);
    setFoodName('');
    setFoodCalories('');
    mutateMeal();
    
    // Check for healthy meal celebration
    const celebration = checkHealthyMeal(calories);
    if (celebration) {
      setShowConfetti(true);
      setToastMessage(celebration.message);
      setToastIcon(celebration.emoji);
      setShowToast(true);
    }
    
    const streakData = updateStreak();
    if (streakData?.isNewLog) {
      if (!celebration) {
        setShowConfetti(true);
        setToastMessage('Måltid loggad!');
        setToastIcon('🍽️');
      }
      setEarnedXP(10 + (streakData.currentStreak * 2));
      setShowToast(true);
    }
  };

  const handleAskAI = async () => {
    if (!userId || !aiMessage) return;
    const context = {
      weightLogs: weightLogs.slice(-5),
      activityLogs: activityLogs.slice(-5),
      mealLogs: mealLogs.slice(-5),
    };
    const response = await askAI(userId, aiMessage, context);
    if (response) {
      alert(`AI Coach (${response.provider}):\n\n${response.response}`);
    }
    setAiMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <SuccessToast
        show={showToast}
        message={toastMessage}
        icon={toastIcon}
        streak={streak.currentStreak}
        xp={earnedXP}
        onClose={() => setShowToast(false)}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">HälsoPartner AI</h1>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
          <p className="text-gray-600">Din personliga AI-hälsocoach</p>
          {user && <p className="text-sm text-gray-500 mt-2">Välkommen, {user.firstName || user.emailAddresses[0].emailAddress}!</p>}
          
          {/* Streak Display */}
          <div className="mt-4 flex gap-4 items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xs opacity-90">Streak</p>
                <p className="font-bold text-lg">{streak.currentStreak} dagar</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs opacity-90">Level {streak.level}</p>
                <p className="font-bold text-lg">{streak.xp} XP</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs opacity-90">Totalt</p>
                <p className="font-bold text-lg">{streak.totalDays} dagar</p>
              </div>
            </div>
          </div>
          
          {/* Achievements */}
          {getAchievements().length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {getAchievements().map((achievement, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg"
                >
                  <span>{achievement.icon}</span>
                  <span>{achievement.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['dashboard', 'health', 'weight', 'activity', 'food', 'ai'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  currentTab === tab
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'health' && '❤️ Hälsa'}
                {tab === 'weight' && '⚖️ Vikt'}
                {tab === 'activity' && '🏃 Aktivitet'}
                {tab === 'food' && '🍎 Mat'}
                {tab === 'ai' && '🎩 Boris'}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Weight Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Viktprogress</h2>
              </div>
              {weightLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : weightChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">Ingen viktdata ännu. Lägg till din första vikt!</p>
              )}
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Aktivitet</h2>
              </div>
              {activityLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : activityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">Ingen aktivitetsdata ännu. Logga din första aktivitet!</p>
              )}
            </div>

            {/* Recent Meals */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Apple className="text-orange-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Senaste måltider</h2>
              </div>
              {mealLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              ) : mealLogs.length > 0 ? (
                <div className="space-y-2">
                  {mealLogs.slice(0, 5).map((meal: any) => (
                    <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{meal.foodName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(meal.mealDate).toLocaleString('sv-SE')}
                        </p>
                      </div>
                      <span className="text-orange-600 font-bold">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">Inga måltider loggade ännu. Lägg till din första måltid!</p>
              )}
            </div>
          </div>
        )}

        {/* Health Tab - Google Fit Style */}
        {currentTab === 'health' && (
          <div className="space-y-6">
            {/* Step Counter Widget */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">👟</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Stepmätare</h2>
                    <p className="text-sm text-gray-600">Dagens steg och aktivitet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600">{stepData.steps.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">steg idag</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Distans</p>
                  <p className="text-2xl font-bold text-orange-600">{stepData.distance.toFixed(2)} km</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Kalorier</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(stepData.calories)}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Aktiv tid</p>
                  <p className="text-2xl font-bold text-purple-600">{stepData.activeMinutes} min</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startTracking}
                  disabled={isTracking}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTracking ? '✓ Tracking aktiv' : 'Starta tracking'}
                </button>
                <button
                  onClick={stopTracking}
                  disabled={!isTracking}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stoppa
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Manuell inmatning:</strong> Lägg till steg manuellt
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addSteps(1000)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    +1000
                  </button>
                  <button
                    onClick={() => addSteps(5000)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    +5000
                  </button>
                  <button
                    onClick={() => addSteps(10000)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    +10000
                  </button>
                </div>
              </div>
            </div>

            {/* Health Dashboard */}
            <HealthDashboard
              goals={goals}
              progress={progress}
              onAddWater={addWater}
              onUpdateHeartRate={updateHeartRate}
              onUpdateSleep={updateSleep}
              onGoalReached={(type) => {
                const celebration = celebrate(type as any);
                if (celebration) {
                  setShowConfetti(true);
                  setToastMessage(celebration.message);
                  setToastIcon(celebration.emoji);
                  setShowToast(true);
                }
              }}
            />
          </div>
        )}

        {/* Weight Tab */}
        {currentTab === 'weight' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Logga vikt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vikt (kg)</label>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="85.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddWeight}
                disabled={!weightInput}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Lägg till vikt
              </button>
            </div>

            {/* Weight History */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Historik</h3>
              {weightLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : weightLogs.length > 0 ? (
                <div className="space-y-2">
                  {weightLogs.map((log: any) => (
                    <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString('sv-SE')}
                      </span>
                      <span className="font-bold text-blue-600">{log.weight} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Ingen viktdata ännu</p>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {currentTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Logga aktivitet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aktivitetstyp</label>
                <input
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  placeholder="Löpning, Gym, Promenad..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Steg</label>
                <input
                  type="number"
                  value={activitySteps}
                  onChange={(e) => setActivitySteps(e.target.value)}
                  placeholder="8500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddActivity}
                disabled={!activityType || !activitySteps}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Lägg till aktivitet
              </button>
            </div>

            {/* Activity History */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Historik</h3>
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : activityLogs.length > 0 ? (
                <div className="space-y-2">
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{log.type}</span>
                        <span className="text-green-600 font-bold">{log.steps} steg</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(log.activityDate).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Ingen aktivitetsdata ännu</p>
              )}
            </div>
          </div>
        )}

        {/* Food Tab */}
        {currentTab === 'food' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Logga mat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maträtt</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Havregrynsgröt med bär"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kalorier</label>
                <input
                  type="number"
                  value={foodCalories}
                  onChange={(e) => setFoodCalories(e.target.value)}
                  placeholder="350"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddMeal}
                disabled={!foodName || !foodCalories}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Lägg till måltid
              </button>
            </div>

            {/* Meal History */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Historik</h3>
              {mealLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              ) : mealLogs.length > 0 ? (
                <div className="space-y-2">
                  {mealLogs.map((meal: any) => (
                    <div key={meal.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{meal.foodName}</span>
                        <span className="text-orange-600 font-bold">{meal.calories} kcal</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(meal.mealDate).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Inga måltider loggade ännu</p>
              )}
            </div>
          </div>
        )}

        {/* Boris AI Coach Tab */}
        {currentTab === 'ai' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎩</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Boris - Din AI-Coach</h2>
                <p className="text-sm text-gray-600">Boris pratar alltid i tredje person och ger personliga råd!</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fråga Boris
                  </label>
                  {isSupported && (
                    <button
                      onClick={() => {
                        if (isListening) {
                          stopListening();
                        } else {
                          resetTranscript();
                          startListening();
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                        isListening
                          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={16} />
                          <span className="text-sm">Stoppa</span>
                        </>
                      ) : (
                        <>
                          <Mic size={16} />
                          <span className="text-sm">🎤 Prata</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ge mig matråd för idag... / Vad tycker Boris om min träning?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                {isListening && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-purple-700">Lyssnar...</span>
                    </div>
                    {interimTranscript && (
                      <p className="text-sm text-gray-600 italic">{interimTranscript}</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleAskAI}
                disabled={!aiMessage || aiLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Boris tänker...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🎩</span>
                    Fråga Boris
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <p className="text-sm text-purple-900 font-medium mb-2">
                🎩 <strong>Om Boris:</strong>
              </p>
              <ul className="text-sm text-purple-800 space-y-1 ml-4">
                <li>• Boris pratar alltid om sig själv i tredje person</li>
                <li>• Boris ger konkreta råd med exakta mängder och tider</li>
                <li>• Boris tycker att du är väl unnt en promenad på 1000 meter!</li>
                <li>• Boris använder din viktdata och aktiviteter för personliga tips</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
