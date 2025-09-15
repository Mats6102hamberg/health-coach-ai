import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingDown, Activity, Apple, MessageCircle, Target, Plus, Save, Award, Brain, Zap, Heart, Trophy, Smartphone, Wifi, Bell, Camera } from 'lucide-react';
import { HealthDataAPI, AICoachAPI } from './services/healthAPI';
import { NotificationService } from './services/notificationService';

const HealthApp = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  
  // Nya AI och PWA states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [realTimeHeartRate, setRealTimeHeartRate] = useState(72);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiProvider, setAiProvider] = useState<'demo' | 'openai' | 'claude'>('demo');
  const [healthDataAPI] = useState(new HealthDataAPI());
  const [aiCoachAPI] = useState(new AICoachAPI());
  const [notificationService] = useState(new NotificationService());

  // AI State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    age: 35,
    height: 175,
    activityLevel: 'moderate',
    preferences: ['pasta', 'choklad', 'pizza'],
    allergies: [],
    workoutTime: 'evening'
  });

  const [weightData, setWeightData] = useState([
    { date: '2025-09-01', weight: 82, target: 78 },
    { date: '2025-09-03', weight: 81.5, target: 78 },
    { date: '2025-09-05', weight: 81.2, target: 78 },
    { date: '2025-09-07', weight: 80.8, target: 78 },
    { date: '2025-09-09', weight: 80.5, target: 78 },
    { date: '2025-09-11', weight: 80.2, target: 78 }
  ]);

  const [activityData, setActivityData] = useState([
    { date: '2025-09-05', steps: 8500, minutes: 45, calories: 320 },
    { date: '2025-09-06', steps: 9200, minutes: 52, calories: 380 },
    { date: '2025-09-07', steps: 7800, minutes: 38, calories: 290 },
    { date: '2025-09-08', steps: 10500, minutes: 65, calories: 450 },
    { date: '2025-09-09', steps: 9800, minutes: 58, calories: 410 },
    { date: '2025-09-10', steps: 8900, minutes: 48, calories: 360 },
    { date: '2025-09-11', steps: 11200, minutes: 72, calories: 520 }
  ]);

  const [foodLog, setFoodLog] = useState([
    { food: 'Havregrynsgröt', calories: 320, time: '08:00', aiRating: 'excellent' },
    { food: 'Sallad med kyckling', calories: 450, time: '12:30', aiRating: 'good' },
    { food: 'Pizza', calories: 680, time: '18:00', aiRating: 'poor' }
  ]);

  const [aiMessages, setAiMessages] = useState([
    { 
      type: 'motivation', 
      message: "🎉 Fantastiskt! Du har gått ner 1.8 kg denna månad! Din konstanta framsteg visar verklig dedikation!",
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    },
    { 
      type: 'nutrition', 
      message: "🍝 Jag ser att du älskar pasta! Prova zucchininudlar med köttfärssås - samma smak men 70% färre kolhydrater!",
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    },
    { 
      type: 'exercise', 
      message: "🏃‍♀️ Baserat på din aktivitetshistorik är du mest aktiv på kvällarna. Perfekt tid för 20 min HIIT-träning!",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    },
    { 
      type: 'goal', 
      message: "🎯 Ny smart målsättning: Baserat på din progress föreslår jag 9500 steg/dag nästa vecka (500 mer än genomsnittet)!",
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // AI Functions
  const analyzeFood = (foodItem: string, calorieAmount: number) => {
    const foodDatabase: Record<string, { rating: string; suggestion: string }> = {
      // Hälsosamma alternativ
      'sallad': { rating: 'excellent', suggestion: 'Perfekt val! Lägg till lite nötter för protein och hälsosamma fetter.' },
      'fisk': { rating: 'excellent', suggestion: 'Utmärkt proteinval! Omega-3 hjälper med inflammation och viktminskning.' },
      'äpplen': { rating: 'excellent', suggestion: 'Bra snack! Fibrer håller dig mätt längre.' },
      'havregrynsgröt': { rating: 'excellent', suggestion: 'Perfekt frukost! Tillsätt bär för extra antioxidanter.' },
      
      // Måttliga alternativ
      'pasta': { rating: 'moderate', suggestion: 'Prova linspasta eller shirataki nudlar - 60% färre kalorier, mer protein!' },
      'ris': { rating: 'moderate', suggestion: 'Byt till blomkålsris eller quinoa för mer näring och färre kalorier.' },
      'bröd': { rating: 'moderate', suggestion: 'Välj fullkornsbröd eller prova cloud bread (endast 25 kcal/skiva)!' },
      
      // Mindre hälsosamma
      'pizza': { rating: 'poor', suggestion: 'Prova blomkålspizza eller protein-pizza - samma smak, 50% färre kalorier!' },
      'chips': { rating: 'poor', suggestion: 'Byt till poppade kikärter eller ugnsrostade grönsaker - lika krispiga!' },
      'glass': { rating: 'poor', suggestion: 'Prova frozen yoghurt eller "nice cream" (frusen banan) - naturligt sött!' },
      'choklad': { rating: 'poor', suggestion: 'Mörk choklad 85% - mindre socker, mer antioxidanter, mindre portioner!' },
      'läsk': { rating: 'poor', suggestion: 'Bubbelvatten med citron eller stevia-sötad läsk - noll kalorier!' }
    };

    const lowerFood = foodItem.toLowerCase();
    const match = Object.keys(foodDatabase).find(key => lowerFood.includes(key));
    
    if (match) {
      const analysis = foodDatabase[match];
      const aiMessage = {
        type: 'nutrition',
        message: `🔍 AI-Matanalys: "${foodItem}" (${calorieAmount} kcal) - ${analysis.suggestion}`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };
      return { analysis, aiMessage };
    }
    
    // Allmän analys baserat på kalorier
    let rating = 'moderate';
    let suggestion = 'Låter intressant! Kom ihåg att balansera med protein och grönsaker.';
    
    if (calorieAmount > 600) {
      rating = 'poor';
      suggestion = `${calorieAmount} kcal är ganska mycket för en måltid. Prova att minska portionen med 30% eller lägg till mer grönsaker för att känna dig mätt.`;
    } else if (calorieAmount < 200) {
      rating = 'good';
      suggestion = 'Bra kaloricontroll! Se till att få tillräckligt med protein för att hålla dig mätt.';
    }

    return {
      analysis: { rating, suggestion },
      aiMessage: {
        type: 'nutrition',
        message: `🔍 AI-Matanalys: "${foodItem}" (${calorieAmount} kcal) - ${suggestion}`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      }
    };
  };

  const generateWorkoutAdvice = () => {
    const currentWeight = weightData[weightData.length - 1]?.weight || 0;
    const avgSteps = activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7;
    const weightLossRate = (weightData[0]?.weight - currentWeight) / weightData.length;
    
    let advice = '';
    
    if (avgSteps < 8000) {
      advice = "🚶‍♀️ Fokusera på att öka daglig aktivitet! Börja med 15 min promenader efter måltider. Små steg leder till stora resultat!";
    } else if (avgSteps < 10000) {
      advice = "💪 Du rör dig bra! Lägg till 2x20 min styrketräning/vecka för att öka muskelmassan och förbränningen.";
    } else {
      advice = "🔥 Fantastisk aktivitetsnivå! Prova intervallträning - 30 sek intensivt, 90 sek vila, upprepa 10 gånger för maximal fettförbränning!";
    }

    if (weightLossRate > 0.5) {
      advice += " OBS: Du går ner för snabbt - öka proteinintaget för att bevara muskelmassa.";
    }

    return {
      type: 'exercise',
      message: advice,
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const generateMotivationalMessage = () => {
    const currentWeight = weightData[weightData.length - 1]?.weight || 0;
    const startWeight = weightData[0]?.weight || 0;
    const targetWeight = 78;
    const progress = ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100;
    const todaySteps = activityData[activityData.length - 1]?.steps || 0;
    
    const motivationalMessages = [
      `🌟 Du har kommit ${Math.round(progress)}% av vägen till ditt mål! Varje dag räknas!`,
      `🔥 ${Math.round(startWeight - currentWeight)} kg borta! Du förvandlar verkligen din kropp!`,
      `💪 Din konsistens är din superkraft! ${weightData.length} dagar av dedikerad tracking!`,
      `🎯 Bara ${Math.round(currentWeight - targetWeight)} kg kvar till målet! Du klarar det här!`,
      `⚡ ${todaySteps} steg idag visar din beslutsamhet! Kroppen tackar dig!`
    ];

    return {
      type: 'motivation',
      message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const setSmartGoals = () => {
    const avgSteps = activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7;
    const weightLossRate = weightData.length > 1 ? 
      (weightData[weightData.length - 2]?.weight - weightData[weightData.length - 1]?.weight) : 0;
    
    let stepGoal = Math.round(avgSteps * 1.1); // 10% ökning
    let weightGoal = weightData[weightData.length - 1]?.weight - 0.5; // 0.5kg per vecka
    let calorieGoal = 1800; // Baserat på aktivitetsnivå

    // Justera mål baserat på prestanda
    if (weightLossRate > 1) {
      weightGoal = weightData[weightData.length - 1]?.weight - 0.3; // Långsammare viktminskning
      calorieGoal = 2000; // Mer kalorier
    }

    if (avgSteps > 12000) {
      stepGoal = Math.round(avgSteps * 1.05); // Mindre ökning om redan mycket aktiv
    }

    return {
      type: 'goal',
      message: `🎯 AI-Smarta mål nästa vecka: ${stepGoal} steg/dag, ${weightGoal}kg vikt, max ${calorieGoal} kcal/dag. Målen anpassas efter din progress!`,
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const addWeight = () => {
    if (weight) {
      const today = new Date().toISOString().split('T')[0];
      const newWeight = parseFloat(weight);
      setWeightData([...weightData, { date: today, weight: newWeight, target: 78 }]);
      
      // AI-analys av viktändring
      const lastWeight = weightData[weightData.length - 1]?.weight;
      if (lastWeight) {
        const change = lastWeight - newWeight;
        let message = '';
        
        if (change > 0.5) {
          message = `🎉 Wow! -${change.toFixed(1)}kg sedan senast! Du är verkligen på rätt spår!`;
        } else if (change > 0) {
          message = `✅ Bra framsteg! -${change.toFixed(1)}kg är en hälsosam viktminskning!`;
        } else if (change < -0.5) {
          message = `⚠️ +${Math.abs(change).toFixed(1)}kg - ingen panik! Fokusera på nästa måltid och kom ihåg att vikt fluktuerar naturligt.`;
        } else {
          message = `📊 Stabil vikt! Kom ihåg att muskler väger mer än fett - kroppen förändras även utan viktminskning!`;
        }
        
        setAiMessages(prev => [{
          type: 'motivation',
          message,
          timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
      }
      
      setWeight('');
    }
  };

  const addActivity = () => {
    if (activity) {
      const today = new Date().toISOString().split('T')[0];
      const steps = parseInt(activity);
      const minutes = Math.round(steps / 120);
      const calories = Math.round(steps * 0.045); // Ungefärlig beräkning
      
      setActivityData([...activityData, { 
        date: today, 
        steps: steps, 
        minutes: minutes,
        calories: calories
      }]);
      
      // AI träningsråd
      const workoutAdvice = generateWorkoutAdvice();
      setAiMessages(prev => [workoutAdvice, ...prev]);
      
      setActivity('');
    }
  };

  const addFood = () => {
    if (food && calories) {
      const { analysis, aiMessage } = analyzeFood(food, parseInt(calories));
      
      setFoodLog([...foodLog, {
        food: food,
        calories: parseInt(calories),
        time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        aiRating: analysis.rating
      }]);
      
      setAiMessages(prev => [aiMessage, ...prev]);
      
      setFood('');
      setCalories('');
    }
  };

  // Initialisera PWA och notifikationer
  useEffect(() => {
    const initializeApp = async () => {
      // Kolla AI-provider status vid start
      const currentProvider = aiCoachAPI.getAIProvider();
      setAiProvider(currentProvider);
      console.log(`🤖 AI Provider: ${currentProvider}`);
      
      // Debug: Touch events
      console.log('📱 Mobil-app initialiserad');
      console.log('Touch support:', 'ontouchstart' in window);
      console.log('User agent:', navigator.userAgent);
      
      // Service Worker och PWA
      if (await notificationService.initialize()) {
        console.log('PWA initialiserad!');
        
        // Kolla om redan installerad
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          setIsPWAInstalled(false);
        });

        // Request notification permissions
        const hasPermission = await notificationService.requestPermission();
        setNotificationsEnabled(hasPermission);
        
        if (hasPermission) {
          await notificationService.subscribeToPush();
          notificationService.scheduleHealthReminders();
        }
      }

      // Online/Offline status
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Real-time hjärtfrekvens simulation
      const stopHeartRate = healthDataAPI.startHeartRateMonitoring(setRealTimeHeartRate);

      // Lyssna på AI-råd requests
      window.addEventListener('requestMoreAIAdvice', handleRequestMoreAIAdvice);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('requestMoreAIAdvice', handleRequestMoreAIAdvice);
        stopHeartRate();
      };
    };

    initializeApp();
  }, []);

  // Automatisk synkning av hälsodata
  useEffect(() => {
    const syncHealthData = async () => {
      if (isOnline) {
        try {
          // Hämta senaste data från telefon (simulerat)
          const steps = await healthDataAPI.getSteps(1);
          const heartRate = await healthDataAPI.getHeartRate();
          const sleep = await healthDataAPI.getSleepData(1);
          
          // Uppdatera aktivitetsdata med riktig telefondata
          if (steps.length > 0) {
            const todaySteps = steps[0];
            setActivityData(prev => {
              const updated = [...prev];
              const lastEntry = updated[updated.length - 1];
              if (lastEntry && lastEntry.date === todaySteps.date) {
                lastEntry.steps = todaySteps.steps;
                lastEntry.calories = todaySteps.calories;
              } else {
                updated.push({
                  date: todaySteps.date,
                  steps: todaySteps.steps,
                  minutes: Math.round(todaySteps.steps / 120),
                  calories: todaySteps.calories
                });
              }
              return updated;
            });
          }

          // Smart notifikationer baserat på data
          if (notificationsEnabled) {
            const userData = {
              steps: steps[0]?.steps || 0,
              heartRate: heartRate.current,
              sleep: sleep[0]?.duration || 7,
              weight: weightData[weightData.length - 1]?.weight,
              targetWeight: 78,
              weeklyWeightLoss: calculateWeeklyWeightLoss()
            };
            
            notificationService.sendSmartNotifications(userData);
          }

        } catch (error) {
          console.log('Offline mode - använder sparad data');
        }
      }
    };

    const interval = setInterval(syncHealthData, 60000); // Var minut
    syncHealthData(); // Kör direkt också

    return () => clearInterval(interval);
  }, [isOnline, notificationsEnabled]);

  const calculateWeeklyWeightLoss = () => {
    if (weightData.length < 2) return 0;
    const recent = weightData.slice(-7);
    if (recent.length < 2) return 0;
    return recent[0].weight - recent[recent.length - 1].weight;
  };

  const handleRequestMoreAIAdvice = async () => {
    await generateAdvancedAIAdvice();
  };

  // Avancerad AI-analys med riktig telefon-data
  const generateAdvancedAIAdvice = async () => {
    setIsLoadingAI(true);
    try {
      const currentWeight = weightData[weightData.length - 1]?.weight || 0;
      const todaySteps = activityData[activityData.length - 1]?.steps || 0;
      
      const userData = {
        weight: currentWeight,
        targetWeight: 78,
        steps: todaySteps,
        heartRate: realTimeHeartRate,
        sleep: 7.5, // Från HealthKit data
        calories: 1800,
        activityLevel: userProfile.activityLevel
      };

      const aiAdvice = await aiCoachAPI.generatePersonalizedAdvice(userData);
      
      // Uppdatera AI-provider baserat på den verkliga providern
      if ('provider' in aiAdvice && aiAdvice.provider) {
        const provider = aiAdvice.provider as 'demo' | 'openai' | 'claude';
        setAiProvider(provider);
      } else {
        // Fallback: kolla vilken provider som används
        const currentProvider = aiCoachAPI.getAIProvider();
        setAiProvider(currentProvider);
      }
      
      setAiMessages(prev => [aiAdvice, ...prev]);
      
      // Skicka som notifikation också
      if (notificationsEnabled) {
        await notificationService.sendAINotification(aiAdvice.message, aiAdvice.type);
      }
      
    } catch (error) {
      console.error('AI-analys misslyckades:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Kamera för matfoto-igenkänning
  const analyzeFoodPhoto = async (imageFile?: File) => {
    if (imageFile) {
      setAiAnalyzing(true);
      try {
        const result = await healthDataAPI.analyzeFoodPhoto(imageFile);
        
        setFoodLog(prev => [...prev, {
          food: result.name,
          calories: result.calories,
          time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
          aiRating: result.confidence > 0.8 ? 'excellent' : 'good'
        }]);

        const aiMessage = {
          type: 'nutrition',
          message: `📸 AI-Fotoanalys: ${result.name} identifierad med ${Math.round(result.confidence * 100)}% säkerhet (${result.calories} kcal)`,
          timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
        };
        
        setAiMessages(prev => [aiMessage, ...prev]);
        
      } catch (error) {
        console.error('Matfoto-analys misslyckades:', error);
      } finally {
        setAiAnalyzing(false);
      }
    }
  };

  // Installera PWA
  const installPWA = async () => {
    // @ts-ignore
    if (window.deferredPrompt) {
      // @ts-ignore
      window.deferredPrompt.prompt();
      // @ts-ignore
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPWAInstalled(true);
      }
      // @ts-ignore
      window.deferredPrompt = null;
    }
  };

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const weightProgress = ((82 - currentWeight) / (82 - 78)) * 100;
  const todaySteps = activityData[activityData.length - 1]?.steps || 0;
  const weeklyAvgSteps = activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7;
  const todayCaloriesBurned = activityData[activityData.length - 1]?.calories || 0;

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-yellow-300" size={24} />
          HälsoPartner AI
        </h1>
        <p className="text-blue-100">Din personliga AI-hälsocoach</p>
      </div>

      {/* Navigation */}
      <div className="flex bg-white shadow-sm overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Översikt', icon: TrendingDown },
          { id: 'weight', label: 'Vikt', icon: Target },
          { id: 'activity', label: 'Aktivitet', icon: Activity },
          { id: 'food', label: 'Mat', icon: Apple },
          { id: 'phone', label: 'Telefon', icon: Smartphone },
          { id: 'ai', label: 'AI-Coach', icon: MessageCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              console.log(`🔥 Tab clicked: ${tab.id}`);
              setCurrentTab(tab.id);
            }}
            onTouchStart={() => {
              console.log(`👆 Tab touched: ${tab.id}`);
            }}
            className={`flex-1 p-3 text-xs flex flex-col items-center min-w-0 touch-target active:bg-blue-100 transition-colors ${
              currentTab === tab.id ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            <span className="mt-1 truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white p-2 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {realTimeHeartRate && (
            <>
              <Heart className="text-red-400" size={12} />
              <span>{realTimeHeartRate} bpm</span>
            </>
          )}
          <div className={`px-2 py-1 rounded text-xs ${
            aiProvider === 'openai' ? 'bg-green-700' : 
            aiProvider === 'claude' ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            AI: {aiProvider === 'openai' ? '🤖 GPT-4' : aiProvider === 'claude' ? '🧠 Claude' : '🏠 Demo'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notificationsEnabled && <Bell className="text-yellow-400" size={12} />}
          {!isPWAInstalled && <Smartphone className="text-blue-400" size={12} />}
          <Wifi className={isOnline ? 'text-green-400' : 'text-gray-400'} size={12} />
        </div>
      </div>

      <div className="p-4">
        {/* Enhanced Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Demo Info Panel */}
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="text-yellow-600" size={16} />
                🎮 Demo-läge aktivt
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>📊 <strong>All data är simulerad</strong> - inte riktiga hälsovärden</p>
                <p>❤️ <strong>Hjärtfrekvens:</strong> Mathematisk simulation (inte din riktiga puls)</p>
                <p>📱 <strong>Telefon-data:</strong> Slumpmässiga värden för demo</p>
                <p>🤖 <strong>AI:</strong> {aiProvider === 'openai' ? 'Riktig OpenAI GPT-4o-mini' : 'Demo-svar'}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                AI-Dashboard
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-blue-600 text-sm">Nuvarande vikt</div>
                  <div className="text-xl font-bold text-blue-800">{currentWeight} kg</div>
                  <div className="text-xs text-blue-600">↓ 1.8kg denna månad</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-600 text-sm">Målvikt</div>
                  <div className="text-xl font-bold text-green-800">78 kg</div>
                  <div className="text-xs text-green-600">{Math.round(weightProgress)}% klart</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-purple-600 text-sm">Steg idag</div>
                  <div className="text-xl font-bold text-purple-800">{todaySteps.toLocaleString()}</div>
                  <div className="text-xs text-purple-600">{todayCaloriesBurned} kcal bränt</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-orange-600 text-sm">AI-Score</div>
                  <div className="text-xl font-bold text-orange-800">8.5/10</div>
                  <div className="text-xs text-orange-600">Utmärkt progress!</div>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Brain className="text-purple-600" size={16} />
                AI-Insikter
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>🧠 <strong>Beteendemönster:</strong> Du är mest aktiv 17-19 - perfekt för kvällsträning!</p>
                <p>📈 <strong>Trend:</strong> Viktminskning accelererar - du har hittat din rytm!</p>
                <p>🎯 <strong>Nästa mål:</strong> Öka protein till 25% av kalorierna för optimal muskelbehållning</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Viktprogress med AI-analys</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{fill: '#3b82f6', r: 4}} />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Weight Tab */}
        {currentTab === 'weight' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Registrera vikt</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    console.log('📝 Vikt ändras:', e.target.value);
                    setWeight(e.target.value);
                  }}
                  onFocus={() => console.log('🎯 Vikt-input fokuserad')}
                  placeholder="Vikt i kg"
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  step="0.1"
                />
                <button 
                  onClick={() => {
                    console.log('💾 Spara vikt:', weight);
                    addWeight();
                  }} 
                  onTouchStart={() => console.log('👆 Vikt-knapp touched')}
                  className="bg-blue-600 text-white p-3 rounded-lg touch-target active:bg-blue-700 transition-colors"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            {/* AI Goal Setting */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Target className="text-green-600" size={16} />
                AI-Smarta mål
              </h3>
              <button 
                onClick={() => setAiMessages(prev => [setSmartGoals(), ...prev])}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Generera nya mål
              </button>
              <div className="mt-2 text-sm text-gray-700">
                <p>Nästa vecka: 79.7 kg (AI-rekommenderat baserat på din trend)</p>
                <p>Månad: 78.5 kg (optimal hållbar viktminskning)</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Vikthistorik med AI-prognoser</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-green-600" size={20} />
                <span className="font-semibold text-gray-800">AI-Framstegsanalys</span>
              </div>
              <div className="text-2xl font-bold text-green-700">-1.8 kg</div>
              <div className="text-sm text-gray-600">Optimal viktminskning! AI föreslår bibehållning av nuvarande tempo.</div>
            </div>
          </div>
        )}

        {/* Enhanced Activity Tab */}
        {currentTab === 'activity' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Registrera aktivitet</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={activity}
                  onChange={(e) => {
                    console.log('📱 Aktivitet ändras:', e.target.value);
                    setActivity(e.target.value);
                  }}
                  onFocus={() => console.log('🎯 Aktivitet-input fokuserad')}
                  placeholder="Antal steg"
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-base"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button 
                  onClick={() => {
                    console.log('💾 Spara aktivitet:', activity);
                    addActivity();
                  }} 
                  onTouchStart={() => console.log('👆 Aktivitet-knapp touched')}
                  className="bg-green-600 text-white p-3 rounded-lg touch-target active:bg-green-700 transition-colors"
                >
                  <Save size={20} />
                </button>
              </div>
            </div>

            {/* AI Workout Recommendations */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="text-orange-600" size={16} />
                AI-Träningsråd
              </h3>
              <button 
                onClick={() => setAiMessages(prev => [generateWorkoutAdvice(), ...prev])}
                onTouchStart={() => {}}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm mb-2 touch-target active:bg-orange-700 transition-colors"
              >
                Få personligt träningsråd
              </button>
              <div className="text-sm text-gray-700">
                <p><strong>Baserat på din data:</strong> Kvällsträning 18-20 ger bästa resultat för dig!</p>
                <p><strong>Rekommendation:</strong> 3x20 min HIIT/vecka + dagliga promenader</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Aktivitet med AI-analys</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 text-sm">AI-Prognos nästa vecka</div>
                <div className="text-xl font-bold text-green-800">{Math.round(weeklyAvgSteps * 1.1).toLocaleString()}</div>
                <div className="text-xs text-green-600">+10% ökning rekommenderas</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 text-sm">Kalorier förbränt</div>
                <div className="text-xl font-bold text-blue-800">{todayCaloriesBurned}</div>
                <div className="text-xs text-blue-600">Idag via aktivitet</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Food Tab */}
        {currentTab === 'food' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Brain className="text-green-600" size={20} />
                AI-Matanalys
                {aiAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>}
              </h2>
              <div className="space-y-3">
                {/* Matfoto-kamera */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Camera className="text-blue-600" size={20} />
                    <span className="text-sm font-medium">Ta foto av mat för AI-analys</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) analyzeFoodPhoto(file);
                      }}
                    />
                  </label>
                </div>
                
                <input
                  type="text"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  placeholder="Vad åt du?"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Kalorier"
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                  />
                  <button onClick={addFood} className="bg-orange-600 text-white p-3 rounded-lg">
                    <Save size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Food Analysis */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Apple className="text-yellow-600" size={16} />
                Senaste matanalyser
              </h3>
              <div className="space-y-2">
                {foodLog.slice(-3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <div>
                      <span className="font-medium">{item.food}</span>
                      <span className="text-sm text-gray-600 ml-2">{item.calories} kcal</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      item.aiRating === 'excellent' ? 'bg-green-100 text-green-800' :
                      item.aiRating === 'good' ? 'bg-yellow-100 text-yellow-800' :
                      item.aiRating === 'moderate' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.aiRating === 'excellent' ? 'Utmärkt' :
                       item.aiRating === 'good' ? 'Bra' :
                       item.aiRating === 'moderate' ? 'Okej' : 'Kan förbättras'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-md font-semibold text-gray-800 mb-3">AI-Smarta substitut</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Vanlig pasta</span>
                  <span className="text-green-600">→ Linspasta (-40% kcal, +protein)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Chips</span>
                  <span className="text-green-600">→ Poppade kikärter (-50% kcal)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Glass</span>
                  <span className="text-green-600">→ Frozen yoghurt (-60% kcal)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Mjölkchoklad</span>
                  <span className="text-green-600">→ Mörk choklad 85% (-30% kcal)</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Läsk</span>
                  <span className="text-green-600">→ Bubbelvatten + citron (0 kcal)</span>
                </div>
              </div>
            </div>

            {/* Nutritional AI Insights */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🧠 AI-Näringsinsikter</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Du äter oftast kolhydrater på kvällen - prova protein istället för bättre sömn</p>
                <p>• Öka fibrer med 5g/dag för förbättrad mättnadskänsla</p>
                <p>• Din proteinfördelning är optimal på morgonen men låg på kvällen</p>
              </div>
            </div>
          </div>
        )}

        {/* Ny Telefon/PWA Tab */}
        {currentTab === 'phone' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Smartphone className="text-blue-600" size={20} />
                Telefon & PWA-funktioner
              </h2>
              
              {/* PWA Installation */}
              {!isPWAInstalled && (
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">📱 Installera som app</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Installera HälsoPartner AI på din telefon för bästa upplevelse!
                  </p>
                  <button 
                    onClick={installPWA}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Installera på telefon
                  </button>
                </div>
              )}

              {/* Notification Settings */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Bell className="text-yellow-600" size={16} />
                  Smarta påminnelser
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Push-notifikationer</span>
                    <div className={`w-8 h-4 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {notificationsEnabled ? '✅ Aktiverade' : '❌ Inaktiverade'} - Vattenintag, rörelse, måltider
                  </p>
                </div>
              </div>

              {/* Real-time Health Data */}
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Heart className="text-red-500" size={16} />
                  Real-time hälsodata
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2 rounded">
                    <div className="text-red-600 text-xs">Hjärtfrekvens</div>
                    <div className="text-lg font-bold text-red-800">{realTimeHeartRate} bpm</div>
                    <div className="text-xs text-gray-600">Live från telefon</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-blue-600 text-xs">Steg idag</div>
                    <div className="text-lg font-bold text-blue-800">{todaySteps.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Auto-synkat</div>
                  </div>
                </div>
              </div>

              {/* AI Setup Guide */}
              {aiProvider === 'demo' && (
                <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg mb-4 border border-orange-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Zap className="text-orange-600" size={16} />
                    🔧 Aktivera riktig AI
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Steg 1:</strong> Gå till <a href="https://platform.openai.com/" target="_blank" className="text-blue-600 underline">platform.openai.com</a></p>
                    <p><strong>Steg 2:</strong> Skapa konto och gå till "API Keys"</p>
                    <p><strong>Steg 3:</strong> Skapa ny nyckel och kopiera den</p>
                    <p><strong>Steg 4:</strong> Öppna <code className="bg-gray-200 px-1 rounded">.env</code> fil i projektroten</p>
                    <p><strong>Steg 5:</strong> Ersätt <code className="bg-gray-200 px-1 rounded">your_openai_api_key_here</code></p>
                    <p><strong>Steg 6:</strong> Starta om appen för att aktivera riktig AI!</p>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-xs text-yellow-800">
                      💡 <strong>Tips:</strong> GPT-4o-mini kostar ~$0.001 per AI-råd. Claude-3-haiku som backup.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Provider Status */}
              {aiProvider !== 'demo' && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Brain className="text-green-600" size={16} />
                    ✅ Riktig AI aktiverad!
                  </h3>
                  <p className="text-sm text-gray-700">
                    Använder {aiProvider === 'openai' ? '🤖 OpenAI GPT-4o-mini' : '🧠 Anthropic Claude-3-haiku'} för personliga hälsoråd.
                  </p>
                </div>
              )}
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-2">🏥 Hälsodata-integration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Apple Health</span>
                    <span className="text-green-600">✅ Ansluten</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Google Fit</span>
                    <span className="text-green-600">✅ Ansluten</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samsung Health</span>
                    <span className="text-gray-500">⏸️ Tillgänglig</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fitbit</span>
                    <span className="text-gray-500">⏸️ Tillgänglig</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Offline Capabilities */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Wifi className={isOnline ? 'text-green-600' : 'text-gray-400'} size={16} />
                Offline-funktioner
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Spara data offline</span>
                  <span className="text-green-600">✅ Aktivt</span>
                </div>
                <div className="flex justify-between">
                  <span>Synka när online</span>
                  <span className="text-green-600">✅ Aktivt</span>
                </div>
                <div className="flex justify-between">
                  <span>AI-råd offline</span>
                  <span className="text-green-600">✅ Aktivt</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Camera & AI Features */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Camera className="text-purple-600" size={16} />
                AI Kamera-funktioner
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg text-left">
                  <div className="font-medium">🍎 Matfoto-igenkänning</div>
                  <div className="text-sm opacity-90">Ta foto av mat för automatisk kaloriberäkning</div>
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-left">
                  <div className="font-medium">📊 Kropp-scanning (demo)</div>
                  <div className="text-sm opacity-90">Uppskatta kroppssammansättning via kamera</div>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-left">
                  <div className="font-medium">🏃‍♀️ Rörelse-tracking</div>
                  <div className="text-sm opacity-90">Spåra träningsform via kamera</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced AI Coach Tab */}
        {currentTab === 'ai' && (
          <div className="space-y-4">
            {/* Mobil-test panel */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Smartphone className="text-blue-600" size={16} />
                📱 Mobil-test
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button 
                  onClick={() => {
                    console.log('🧪 Test-knapp 1 klickad');
                    alert('Test 1 fungerar! 🎉');
                  }}
                  onTouchStart={() => console.log('👆 Test-knapp 1 touched')}
                  className="bg-blue-600 text-white p-3 rounded-lg text-sm touch-target active:bg-blue-700 transition-colors"
                >
                  🧪 Test klick
                </button>
                <button 
                  onClick={() => {
                    console.log('🎯 Test-knapp 2 klickad');
                    setAiMessages(prev => [{
                      type: 'test',
                      message: '🧪 Mobil-interaktion fungerar! Tid: ' + new Date().toLocaleTimeString('sv-SE'),
                      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
                    }, ...prev]);
                  }}
                  onTouchStart={() => console.log('👆 Test-knapp 2 touched')}
                  className="bg-green-600 text-white p-3 rounded-lg text-sm touch-target active:bg-green-700 transition-colors"
                >
                  ✅ Test AI-meddelande
                </button>
              </div>
              <p className="text-xs text-gray-600">Om dessa knappar fungerar så fungerar resten också. Kolla Console för debug-info.</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="text-blue-600" size={20} />
                Din AI-Coach
                <div className="ml-auto flex gap-1">
                  <Heart className="text-red-500" size={16} />
                  <Brain className="text-purple-500" size={16} />
                  <Zap className="text-yellow-500" size={16} />
                </div>
                {isLoadingAI && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
              </h2>
              
              {/* AI Message Generator Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  onClick={() => setAiMessages(prev => [generateMotivationalMessage(), ...prev])}
                  className="bg-green-600 text-white p-2 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Trophy size={12} />
                  Motivation
                </button>
                <button 
                  onClick={() => setAiMessages(prev => [generateWorkoutAdvice(), ...prev])}
                  className="bg-orange-600 text-white p-2 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Activity size={12} />
                  Träningsråd
                </button>
                <button 
                  onClick={generateAdvancedAIAdvice}
                  disabled={isLoadingAI}
                  className="bg-purple-600 text-white p-2 rounded text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Brain size={12} />
                  Avancerad AI
                </button>
                <button 
                  onClick={() => setAiMessages(prev => [setSmartGoals(), ...prev])}
                  className="bg-blue-600 text-white p-2 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Target size={12} />
                  Smarta mål
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {aiMessages.map((message, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    message.type === 'motivation' ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-600' :
                    message.type === 'nutrition' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-600' :
                    message.type === 'exercise' ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-600' :
                    message.type === 'comprehensive' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-600' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-600'
                  }`}>
                    <p className="text-sm text-gray-800">{message.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">AI-Coach • {message.timestamp}</span>
                      <div className={`px-2 py-1 rounded text-xs ${
                        message.type === 'motivation' ? 'bg-green-100 text-green-800' :
                        message.type === 'nutrition' ? 'bg-yellow-100 text-yellow-800' :
                        message.type === 'exercise' ? 'bg-orange-100 text-orange-800' :
                        message.type === 'comprehensive' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {message.type === 'motivation' ? '🏆 Motivation' :
                         message.type === 'nutrition' ? '🍎 Nutrition' :
                         message.type === 'exercise' ? '💪 Träning' :
                         message.type === 'comprehensive' ? '🧠 Avancerad' : '🎯 Mål'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Target className="text-green-600" size={16} />
                🎯 AI-Fokus idag
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 💧 Drick 2.5L vatten (ökar förbränning med 10%)</li>
                <li>• 🥗 Ät protein vid varje måltid (bevara muskelmassa)</li>
                <li>• 🚶‍♀️ 15 min promenad efter middagen (förbättrar blodsockret)</li>
                <li>• 😴 Sov 7-8h (viktigt för viktreglering)</li>
                <li>• 📱 Synka telefondata för bättre AI-analys</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Brain className="text-purple-600" size={16} />
                💡 Personliga AI-insikter
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Beteendemönster:</strong> Du äter minst kalorier på måndagar - använd det som "reset-dag"!</p>
                <p><strong>Aktivitetstrender:</strong> 23% mer aktiv när du träcker mat - fortsätt med båda!</p>
                <p><strong>Optimal timing:</strong> Dina bästa viktminskningsdagar följer höga proteindagar.</p>
                <p><strong>Nästa nivå:</strong> Lägg till 15min styrketräning 2x/vecka för 30% snabbare resultat.</p>
                <p><strong>Real-time:</strong> Hjärtfrekvens {realTimeHeartRate} bpm indikerar {realTimeHeartRate > 80 ? 'stress - ta deep breaths!' : 'lugn - perfekt för träning!'}</p>
              </div>
            </div>

            {/* AI Statistics */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">📊 AI-Statistik</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-purple-600">AI-Råd givna</div>
                  <div className="text-xl font-bold text-purple-800">{aiMessages.length}</div>
                </div>
                <div>
                  <div className="text-pink-600">Framstegsscore</div>
                  <div className="text-xl font-bold text-pink-800">94%</div>
                </div>
                <div>
                  <div className="text-purple-600">Telefon-synk</div>
                  <div className="text-xl font-bold text-purple-800">{isOnline ? '✅' : '⏸️'}</div>
                </div>
                <div>
                  <div className="text-pink-600">Push-notiser</div>
                  <div className="text-xl font-bold text-pink-800">{notificationsEnabled ? '🔔' : '🔕'}</div>
                </div>
              </div>
            </div>

            {/* Advanced AI Features */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="text-yellow-500" size={16} />
                🚀 Avancerade AI-funktioner
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-purple-50 rounded">
                  <span>Personaliserad träningsplan</span>
                  <span className="text-purple-600">✨ AI-Genererad</span>
                </div>
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span>Prediktiv hälsoanalys</span>
                  <span className="text-blue-600">🔮 Prognos</span>
                </div>
                <div className="flex justify-between p-2 bg-green-50 rounded">
                  <span>Smart målsättning</span>
                  <span className="text-green-600">🎯 Adaptiv</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 rounded">
                  <span>Beteendemönster-AI</span>
                  <span className="text-orange-600">🧠 Lärande</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthApp;
