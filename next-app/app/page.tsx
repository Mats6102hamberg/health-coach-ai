'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, Activity, Apple, MessageCircle, Plus, Loader2 } from 'lucide-react';
import { useUser, createUser } from '@/lib/hooks/useUser';
import { useWeightLogs, addWeightLog } from '@/lib/hooks/useWeight';
import { useActivityLogs, addActivityLog } from '@/lib/hooks/useActivity';
import { useMealLogs, addMealLog } from '@/lib/hooks/useMeal';
import { useAICoach } from '@/lib/hooks/useAICoach';
import { useStreak } from '@/lib/hooks/useStreak';
import { Confetti } from '@/components/Confetti';
import { SuccessToast } from '@/components/SuccessToast';

const DEMO_USER_EMAIL = 'mats@halsopartner.se';

export default function HealthApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userId, setUserId] = useState<string | null>(null);

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

  // API hooks
  const { user, isLoading: userLoading, mutate: mutateUser } = useUser(DEMO_USER_EMAIL);
  const { weightLogs, isLoading: weightLoading, mutate: mutateWeight } = useWeightLogs(userId || undefined);
  const { activityLogs, isLoading: activityLoading, mutate: mutateActivity } = useActivityLogs(userId || undefined);
  const { mealLogs, isLoading: mealLoading, mutate: mutateMeal } = useMealLogs(userId || undefined);
  const { askAI, isLoading: aiLoading } = useAICoach();
  const { streak, updateStreak, getAchievements } = useStreak(userId || undefined);

  // Initialize user
  useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
    } else if (!userLoading && !user) {
      createUser(DEMO_USER_EMAIL, 'Mats Hamberg').then((newUser) => {
        setUserId(newUser.id);
        mutateUser();
      });
    }
  }, [user, userLoading, mutateUser]);

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
    await addWeightLog(userId, parseFloat(weightInput));
    setWeightInput('');
    mutateWeight();
    
    const streakData = updateStreak();
    if (streakData?.isNewLog) {
      setShowConfetti(true);
      setToastMessage('Vikt loggad!');
      setToastIcon('⚖️');
      setEarnedXP(10 + (streakData.currentStreak * 2));
      setShowToast(true);
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
    await addMealLog(userId, 'Måltid', foodName, parseInt(foodCalories));
    setFoodName('');
    setFoodCalories('');
    mutateMeal();
    
    const streakData = updateStreak();
    if (streakData?.isNewLog) {
      setShowConfetti(true);
      setToastMessage('Måltid loggad!');
      setToastIcon('🍽️');
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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HälsoPartner AI</h1>
          <p className="text-gray-600">Din personliga AI-hälsocoach</p>
          {user && <p className="text-sm text-gray-500 mt-2">Inloggad som: {user.email}</p>}
          
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
            {['dashboard', 'weight', 'activity', 'food', 'ai'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  currentTab === tab
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'weight' && '⚖️ Vikt'}
                {tab === 'activity' && '🏃 Aktivitet'}
                {tab === 'food' && '🍎 Mat'}
                {tab === 'ai' && '🤖 AI Coach'}
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

        {/* AI Coach Tab */}
        {currentTab === 'ai' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">AI Coach</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fråga din AI-coach
                </label>
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ge mig råd om min träning idag..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAskAI}
                disabled={!aiMessage || aiLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI tänker...
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    Fråga AI Coach
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800">
                💡 <strong>Tips:</strong> AI-coachen använder din viktdata, aktiviteter och måltider för att ge
                personliga råd. Ju mer data du loggar, desto bättre råd får du!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
