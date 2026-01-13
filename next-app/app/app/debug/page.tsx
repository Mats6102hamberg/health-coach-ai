'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { borisApi, getToday, getCurrentWeek, BorisApiError } from '@/lib/borisApi';
import { Loader2 } from 'lucide-react';

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleTest = async (name: string, fn: () => Promise<any>) => {
    setLoading(true);
    setLastError(null);
    setLastResponse(null);

    try {
      const result = await fn();
      setLastResponse({ action: name, data: result });
    } catch (error) {
      if (error instanceof BorisApiError) {
        setLastError(`${error.code}: ${error.message}`);
      } else {
        setLastError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Health Check',
      description: 'Test public health endpoint',
      fn: () => borisApi.health(),
    },
    {
      name: 'Profile Get',
      description: 'Get user profile',
      fn: () => borisApi.profile.get(),
    },
    {
      name: 'Profile Upsert',
      description: 'Update profile with nickname and goal',
      fn: () => borisApi.profile.upsert({
        nickname: 'Mats',
        goalFocus: 'energi',
      }),
    },
    {
      name: 'Dashboard Get',
      description: 'Get dashboard data',
      fn: () => borisApi.dashboard.get(),
    },
    {
      name: 'DailyLog Upsert',
      description: 'Log today\'s health data',
      fn: () => borisApi.dailyLog.upsert({
        date: getToday(),
        steps: 1234,
        waterMl: 500,
        sleepMinutes: 420,
        heartRateAvg: 70,
      }),
    },
    {
      name: 'DailyLog GetRange',
      description: 'Get last 7 days of logs',
      fn: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        
        return borisApi.dailyLog.getRange(
          formatDate(sevenDaysAgo),
          formatDate(today)
        );
      },
    },
    {
      name: 'WeeklySummary Get',
      description: 'Get current week summary',
      fn: () => {
        const week = getCurrentWeek();
        return borisApi.weeklySummary.get(week.start);
      },
    },
    {
      name: 'Streak Get',
      description: 'Get current streak',
      fn: () => borisApi.streak.get(),
    },
    {
      name: 'Achievement List',
      description: 'Get all achievements',
      fn: () => borisApi.achievement.list(),
    },
    {
      name: 'Onboarding Complete',
      description: 'Mark onboarding as complete',
      fn: () => borisApi.onboarding.complete(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🔧 Boris API Debug</h1>
              <p className="text-gray-600">Test all Boris API endpoints with Clerk authentication</p>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Buttons */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">API Tests</h2>
            <div className="space-y-3">
              {tests.map((test) => (
                <button
                  key={test.name}
                  onClick={() => handleTest(test.name, test.fn)}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{test.name}</div>
                      <div className="text-sm text-gray-600">{test.description}</div>
                    </div>
                    {loading && (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Last Response */}
            {lastResponse && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  ✅ Last Response: {lastResponse.action}
                </h2>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(lastResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Last Error */}
            {lastError && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-red-600 mb-4">❌ Last Error</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap">
                    {lastError}
                  </pre>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!lastResponse && !lastError && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Instructions</h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>1. Health Check:</strong> Test public endpoint (no auth required)
                  </p>
                  <p>
                    <strong>2. Profile Get:</strong> Fetch your user profile from database
                  </p>
                  <p>
                    <strong>3. Profile Upsert:</strong> Update profile with nickname="Mats" and goalFocus="energi"
                  </p>
                  <p>
                    <strong>4. Dashboard Get:</strong> Get dashboard data (today's stats, weight, meals, streak)
                  </p>
                  <p>
                    <strong>5. DailyLog Upsert:</strong> Log today's data (steps=1234, water=500ml, sleep=420min, HR=70)
                  </p>
                  <p>
                    <strong>6. DailyLog GetRange:</strong> Fetch last 7 days of daily logs
                  </p>
                  <p>
                    <strong>7. WeeklySummary Get:</strong> Get current week summary (Mon-Sun)
                  </p>
                  <p>
                    <strong>8. Streak Get:</strong> Get current streak data
                  </p>
                  <p>
                    <strong>9. Achievement List:</strong> Get all unlocked achievements
                  </p>
                  <p>
                    <strong>10. Onboarding Complete:</strong> Mark onboarding as complete
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Quick Info</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="font-semibold text-blue-800 mb-1">Today's Date</div>
              <div className="text-blue-600">{getToday()}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="font-semibold text-purple-800 mb-1">Current Week</div>
              <div className="text-purple-600">
                {getCurrentWeek().start} → {getCurrentWeek().end}
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="font-semibold text-green-800 mb-1">API Endpoint</div>
              <div className="text-green-600">/api/boris</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
