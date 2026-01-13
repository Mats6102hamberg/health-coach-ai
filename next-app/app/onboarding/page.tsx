'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    goal: 'lose_weight',
    activityLevel: 'moderate',
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleComplete = () => {
    // TODO: Save onboarding data to database via Boris API
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎩 Välkommen till HälsoPartner AI!
            </h1>
            <p className="text-gray-600">
              Hej {user?.firstName || 'där'}! Låt oss sätta upp din profil.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Steg {step} av 3</span>
              <span className="text-sm font-medium text-gray-700">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Grundläggande information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vikt (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Längd (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ålder
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Nästa →
              </button>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ditt hälsomål</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vad vill du uppnå?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'lose_weight', label: '🎯 Gå ner i vikt', emoji: '📉' },
                    { value: 'gain_muscle', label: '💪 Bygga muskler', emoji: '🏋️' },
                    { value: 'maintain', label: '⚖️ Behålla vikten', emoji: '✅' },
                    { value: 'improve_health', label: '❤️ Förbättra hälsan', emoji: '🌟' },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        formData.goal === goal.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mr-3">{goal.emoji}</span>
                      <span className="font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ← Tillbaka
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Nästa →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Activity Level */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivitetsnivå</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hur aktiv är du?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'sedentary', label: 'Stillasittande', desc: 'Lite eller ingen träning' },
                    { value: 'light', label: 'Lätt aktiv', desc: '1-3 dagar/vecka' },
                    { value: 'moderate', label: 'Måttligt aktiv', desc: '3-5 dagar/vecka' },
                    { value: 'very_active', label: 'Mycket aktiv', desc: '6-7 dagar/vecka' },
                    { value: 'extra_active', label: 'Extremt aktiv', desc: 'Daglig intensiv träning' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        formData.activityLevel === level.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ← Tillbaka
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  🎉 Slutför
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Boris Welcome Message */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎩</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Boris säger:</h3>
              <p className="text-gray-600">
                "Boris är redo att hjälpa dig nå dina mål! Boris kommer att ge dig personliga råd, 
                följa din progress och fira dina framgångar. Låt oss göra detta tillsammans!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
