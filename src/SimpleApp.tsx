import React, { useState } from 'react';
import { Heart, Activity, Apple, Target, MessageCircle, TrendingDown } from 'lucide-react';

const SimpleApp = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [testMessage, setTestMessage] = useState('');

  const handleTabClick = (tabId: string) => {
    console.log('Tab clicked:', tabId);
    setCurrentTab(tabId);
    setTestMessage(`Växlade till ${tabId} - ${new Date().toLocaleTimeString()}`);
  };

  const handleTestButton = () => {
    console.log('Test button clicked!');
    alert('Mobiltest fungerar! 🎉');
    setTestMessage('Test-knapp klickad: ' + new Date().toLocaleTimeString());
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
        <h1 className="text-2xl font-bold">HälsoPartner AI - Test</h1>
        <p className="text-blue-100">Mobil-kompatibilitetstest</p>
      </div>

      {/* Navigation */}
      <div className="flex bg-white shadow-sm">
        {[
          { id: 'dashboard', label: 'Hem', icon: TrendingDown },
          { id: 'weight', label: 'Vikt', icon: Target },
          { id: 'activity', label: 'Aktivitet', icon: Activity },
          { id: 'food', label: 'Mat', icon: Apple },
          { id: 'ai', label: 'AI', icon: MessageCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 p-3 text-xs flex flex-col items-center ${
              currentTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            <tab.icon size={16} />
            <span className="mt-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-2">📱 Mobil-test</h2>
          <p className="text-sm text-gray-600 mb-3">Nuvarande flik: <strong>{currentTab}</strong></p>
          {testMessage && (
            <div className="bg-green-100 p-2 rounded text-sm text-green-800 mb-3">
              {testMessage}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3">🧪 Test-knappar</h3>
          <div className="space-y-2">
            <button
              onClick={handleTestButton}
              className="w-full bg-blue-600 text-white p-3 rounded-lg text-sm"
            >
              🎯 Test Alert
            </button>
            <button
              onClick={() => setTestMessage('Meddelande-test: ' + new Date().toLocaleTimeString())}
              className="w-full bg-green-600 text-white p-3 rounded-lg text-sm"
            >
              ✅ Test Meddelande
            </button>
          </div>
        </div>

        {/* Simple Input Test */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3">⌨️ Input-test</h3>
          <input
            type="number"
            placeholder="Skriv ett nummer"
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
            onChange={(e) => setTestMessage(`Input: ${e.target.value}`)}
          />
        </div>

        {/* Heart Rate Simulation */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Heart className="text-red-500" size={16} />
            Hjärtfrekvens (simulerad)
          </h3>
          <div className="text-2xl font-bold text-red-600">
            {Math.round(70 + Math.sin(Date.now() / 1000) * 10)} bpm
          </div>
          <p className="text-xs text-gray-500 mt-1">Uppdateras automatiskt (ej riktig data)</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
