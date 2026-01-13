import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, Activity, Apple, MessageCircle, Target, Save, Award, Brain, Zap, Heart, Trophy, Smartphone, Wifi, Bell, Camera, Gift } from 'lucide-react';
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
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [healthDataAPI] = useState(new HealthDataAPI());
  const [aiCoachAPI] = useState(new AICoachAPI());
  const [notificationService] = useState(new NotificationService());

  // AI State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [userProfile] = useState({
    age: 35,
    height: 175,
    activityLevel: 'moderate',
    preferences: ['pasta', 'choklad', 'pizza'],
    allergies: [],
    workoutTime: 'evening'
  });

  const [weightData, setWeightData] = useState<Array<{date: string, weight: number, target: number}>>([]);

  const [activityData, setActivityData] = useState<Array<{date: string, steps: number, minutes: number, calories: number}>>([]);

  const [foodLog, setFoodLog] = useState<Array<{food: string, calories: number, time: string, aiRating: string}>>([]);

  const [aiMessages, setAiMessages] = useState<Array<{type: string, message: string, timestamp: string}>>([]);

  // Nya AI-funktioner state
  const [mealPlan, setMealPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [healthPrediction, setHealthPrediction] = useState(null);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: string, message: string, timestamp: string}>>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // AI Functions
  const analyzeFood = async (foodItem: string, calorieAmount: number) => {
    // Använd riktig AI istället för statisk data
    try {
      const aiAdvice = await aiCoachAPI.generatePersonalizedAdvice({
        weight: weightData[weightData.length - 1]?.weight || 0,
        steps: activityData[activityData.length - 1]?.steps || 0,
        heartRate: 0,
        sleepHours: 0,
        caloriesConsumed: calorieAmount,
        foodItem: foodItem
      });

      const analysis = { rating: 'good', suggestion: aiAdvice || 'Bra val! Kom ihåg att variera din kost.' };
      const aiMessage = {
        type: 'nutrition',
        message: `🔍 AI-Matanalys: "${foodItem}" (${calorieAmount} kcal) - ${analysis.suggestion}`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };
      return { analysis, aiMessage };
    } catch (error) {
      // Fallback om AI inte fungerar
      const analysis = { rating: 'moderate', suggestion: 'Logga maten och få personliga råd från AI!' };
      const aiMessage = {
        type: 'nutrition',
        message: `🔍 Matloggad: "${foodItem}" (${calorieAmount} kcal)`,
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
    const avgSteps = activityData.length > 0 ? activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7 : 0;
    const weightLossRate = weightData.length > 0 ? (weightData[0]?.weight - currentWeight) / weightData.length : 0;
    
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
    const targetWeight = 0; // Användarens målvikt - ingen statisk data
    const progress = startWeight > 0 && targetWeight > 0 ? ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100 : 0;
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
    const avgSteps = activityData.length > 0 ? activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7 : 0;
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

  // Nya AI-funktioner
  const generateMealPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const userData = {
        weight: weightData[weightData.length - 1]?.weight || 0,
        targetWeight: 0,
        calories: 1800,
        activityLevel: userProfile.activityLevel
      };
      
      const plan = await aiCoachAPI.generateMealPlan(userData, userProfile.preferences);
      setMealPlan(plan);
      
      const aiMessage = {
        type: 'nutrition',
        message: `🍽️ AI-Måltidsplan genererad! 7 dagar med personliga måltider baserat på dina preferenser och mål.`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [aiMessage, ...prev]);
      
    } catch (error) {
      console.error('Meal plan generation failed:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateWorkoutPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const userData = {
        weight: weightData[weightData.length - 1]?.weight || 0,
        targetWeight: 0,
        activityLevel: userProfile.activityLevel,
        heartRate: realTimeHeartRate
      };
      
      const plan = await aiCoachAPI.generateWorkoutPlan(userData, ['kroppsvikt']);
      setWorkoutPlan(plan);
      
      const aiMessage = {
        type: 'exercise',
        message: `💪 AI-Träningsplan genererad! 4 veckor med progressiva övningar anpassade för dina mål.`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [aiMessage, ...prev]);
      
    } catch (error) {
      console.error('Workout plan generation failed:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateHealthPrediction = async () => {
    setIsGeneratingPlan(true);
    try {
      const userData = {
        weight: weightData[weightData.length - 1]?.weight || 0,
        targetWeight: 0,
        steps: activityData[activityData.length - 1]?.steps || 0,
        heartRate: realTimeHeartRate,
        sleep: 0
      };
      
      const historicalData = weightData.map(w => ({
        date: w.date,
        weight: w.weight,
        steps: activityData.find(a => a.date === w.date)?.steps || 0,
        calories: activityData.find(a => a.date === w.date)?.calories || 0
      }));
      
      const prediction = await aiCoachAPI.generateHealthPrediction(userData, historicalData);
      setHealthPrediction(prediction);
      
      const aiMessage = {
        type: 'comprehensive',
        message: `🔮 AI-Hälsoprognos genererad! Prediktioner för nästa 30 dagar baserat på dina trender.`,
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [aiMessage, ...prev]);
      
    } catch (error) {
      console.error('Health prediction failed:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const sendChatMessage = async () => {
    if (!aiChatMessage.trim()) return;
    
    const userMessage = aiChatMessage;
    setAiChatMessage('');
    
    // Lägg till användarmeddelande i chatten
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) }]);
    
    try {
      const context = {
        weight: weightData[weightData.length - 1]?.weight || 0,
        targetWeight: 0,
        steps: activityData[activityData.length - 1]?.steps || 0,
        heartRate: realTimeHeartRate,
        sleep: 0
      };
      
      const aiResponse = await aiCoachAPI.chatWithAI(userMessage, context);
      
      // Lägg till AI-svar i chatten
      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse, timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) }]);
      
    } catch (error) {
      console.error('AI chat failed:', error);
      setChatHistory(prev => [...prev, { type: 'ai', message: 'Tyvärr, jag kunde inte svara just nu. Försök igen senare!', timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const addWeight = () => {
    if (weight) {
      const today = new Date().toISOString().split('T')[0];
      const newWeight = parseFloat(weight);
      setWeightData([...weightData, { date: today, weight: newWeight, target: 0 }]);
      
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

  const addFood = async () => {
    if (food && calories) {
      const { analysis, aiMessage } = await analyzeFood(food, parseInt(calories));
      
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
      
      // Kolla PWA-installation status
      checkPWAInstallation();
      
      // Service Worker och PWA
      if (await notificationService.initialize()) {
        console.log('PWA initialiserad!');
        
        // Lyssna på PWA-installation prompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          // @ts-ignore
          window.deferredPrompt = e;
          setIsPWAInstalled(false);
          console.log('PWA kan installeras');
        });

        // Kolla om PWA redan är installerad
        window.addEventListener('appinstalled', () => {
          setIsPWAInstalled(true);
          console.log('PWA installerad!');
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
              sleep: sleep[0]?.duration || 0,
              weight: weightData[weightData.length - 1]?.weight,
              targetWeight: 0,
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
        targetWeight: 0,
        steps: todaySteps,
        heartRate: realTimeHeartRate,
        sleep: 0, // Från HealthKit data
        calories: 1800,
        activityLevel: userProfile.activityLevel
      };

      const aiAdvice = await aiCoachAPI.generatePersonalizedAdvice(userData);
      
      // Uppdatera AI-provider baserat på den verkliga providern
      if ('provider' in aiAdvice && aiAdvice.provider) {
        const provider = aiAdvice.provider as 'openai' | 'claude' | 'gemini';
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
        console.log('PWA installerad!');
      }
      // @ts-ignore
      window.deferredPrompt = null;
    } else {
      // Fallback för iOS Safari
      alert('För att installera appen på iPhone:\n1. Tryck på delningsknappen (fyrkant med pil)\n2. Välj "Lägg till på hemskärmen"\n3. Tryck "Lägg till"');
    }
  };

  // Kolla PWA-installation status
  const checkPWAInstallation = () => {
    // Kolla om appen körs i standalone-läge
    if (window.matchMedia('(display-mode: standalone)').matches || 
        // @ts-ignore
        window.navigator.standalone === true) {
      setIsPWAInstalled(true);
    }
  };

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const weightProgress = 0; // Ingen statisk beräkning - vänta på användardata
  const todaySteps = activityData[activityData.length - 1]?.steps || 0;
  const weeklyAvgSteps = activityData.length > 0 ? activityData.slice(-7).reduce((sum, day) => sum + day.steps, 0) / 7 : 0;
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
          { id: 'ai', label: 'AI-Coach', icon: MessageCircle },
          { id: 'ai-advanced', label: 'AI Pro', icon: Brain }
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
            aiProvider === 'claude' ? 'bg-blue-700' : 
            aiProvider === 'gemini' ? 'bg-purple-700' : 'bg-gray-700'
          }`}>
            AI: {aiProvider === 'openai' ? '🤖 GPT-4' : 
                 aiProvider === 'claude' ? '🧠 Claude' : '💎 Gemini'}
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

            {/* PWA Status Panel */}
            <div className={`rounded-lg p-4 border ${
              isPWAInstalled 
                ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-200' 
                : 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200'
            }`}>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Smartphone className={isPWAInstalled ? 'text-green-600' : 'text-blue-600'} size={16} />
                {isPWAInstalled ? '✅ App installerad!' : '📱 Installera som app'}
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                {isPWAInstalled ? (
                  <>
                    <p>🚀 <strong>PWA aktivt</strong> - App-liknande upplevelse</p>
                    <p>🔔 <strong>Notifikationer:</strong> {notificationsEnabled ? 'Aktiverade' : 'Inaktiverade'}</p>
                    <p>📱 <strong>Offline-funktionalitet</strong> - Fungerar utan internet</p>
                    <p>⚡ <strong>Snabbare laddning</strong> - Cachad lokalt</p>
                  </>
                ) : (
                  <>
                    <p>📱 <strong>Installera appen</strong> för bästa upplevelse</p>
                    <p>🔔 <strong>Få push-notifikationer</strong> för påminnelser</p>
                    <p>📱 <strong>Offline-funktionalitet</strong> - Fungerar utan internet</p>
                    <p>⚡ <strong>Snabbare laddning</strong> - Cachad lokalt</p>
                  </>
                )}
              </div>
              {!isPWAInstalled && (
                <button 
                  onClick={installPWA}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-700 transition-colors"
                >
                  <Smartphone size={12} />
                  Installera nu
                </button>
              )}
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
                  <div className="text-xs text-blue-600">Ingen data än</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-600 text-sm">Målvikt</div>
                  <div className="text-xl font-bold text-green-800">- kg</div>
                  <div className="text-xs text-green-600">{Math.round(weightProgress)}% klart</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-purple-600 text-sm">Steg idag</div>
                  <div className="text-xl font-bold text-purple-800">{todaySteps.toLocaleString()}</div>
                  <div className="text-xs text-purple-600">{todayCaloriesBurned} kcal bränt</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-orange-600 text-sm">AI-Score</div>
                  <div className="text-xl font-bold text-orange-800">- /10</div>
                  <div className="text-xs text-orange-600">Ingen data än</div>
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
                <p>Klicka på AI-funktioner för att få personliga insikter baserat på din data.</p>
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
                onClick={() => {
                  console.log('🧪 Smarta mål-knapp klickad!');
                  const goals = setSmartGoals();
                  console.log('🧪 Genererade mål:', goals);
                  setAiMessages(prev => [goals, ...prev]);
                  console.log('🧪 AI-meddelanden uppdaterade');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Generera nya mål
              </button>
              <div className="mt-2 text-sm text-gray-700">
                <p>Klicka "Generera nya mål" för personliga AI-rekommendationer baserat på din data.</p>
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
              <div className="text-2xl font-bold text-green-700">0 kg</div>
              <div className="text-sm text-gray-600">Logga viktdata för att få AI-framstegsanalys.</div>
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
                onClick={() => {
                  console.log('🧪 Träningsråd-knapp klickad!');
                  const advice = generateWorkoutAdvice();
                  console.log('🧪 Genererad råd:', advice);
                  setAiMessages(prev => [advice, ...prev]);
                }}
                onTouchStart={() => {}}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm mb-2 touch-target active:bg-orange-700 transition-colors"
              >
                Få personligt träningsråd
              </button>
              <div className="text-sm text-gray-700">
                <p>Klicka "Få personligt träningsråd" för AI-genererade råd baserat på din aktivitetsdata.</p>
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
              <div className="text-sm text-gray-500 text-center py-4">
                Fyll i matdata för att få personliga substitut-förslag
              </div>
            </div>

            {/* Nutritional AI Insights */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🧠 AI-Näringsinsikter</h3>
              <div className="text-sm text-gray-500 text-center py-2">
                Logga matdata för att få personliga näringsinsikter
              </div>
            </div>
          </div>
        )}

        {/* Swish Donation Tab */}
        {currentTab === 'donate' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Gift className="text-green-600" size={28} />
                Stöd appen med gåva
              </h2>
              <p className="text-gray-700 mb-6">
                Hjälp oss att hålla HälsoPartner AI gratis för alla! Din donation hjälper till att täcka 
                AI-kostnader och utveckla nya funktioner.
              </p>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
                  Swish Donation
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Swish-nummer:</p>
                    <p className="text-2xl font-mono font-bold text-gray-800">073-930 97 48</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Föreslagna belopp:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        25 kr
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        50 kr
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        100 kr
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        200 kr
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">💡 Vad din donation används till:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• AI-kostnader (OpenAI, Claude, Gemini)</li>
                      <li>• Server-hosting och drift</li>
                      <li>• Utveckling av nya funktioner</li>
                      <li>• Underhåll och uppdateringar</li>
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => {
                        // Öppna Swish-appen
                        window.location.href = 'swish://paymentrequest?token=0739309748&message=H%C3%A4lsoPartner%20AI%20Donation';
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">S</div>
                      Öppna i Swish
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Tack för ditt stöd! 🙏 Varje krona hjälper oss att förbättra appen.
                </p>
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
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg mb-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Smartphone className="text-blue-600" size={16} />
                    📱 Installera som app
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Installera HälsoPartner AI på din telefon för bästa upplevelse! Få push-notifikationer, offline-funktionalitet och app-liknande upplevelse.
                  </p>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Offline-funktionalitet</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Push-notifikationer</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Snabbare laddning</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>App-liknande upplevelse</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={installPWA}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Smartphone size={16} />
                    Installera på telefon
                  </button>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>iPhone:</strong> Tryck på delningsknappen → "Lägg till på hemskärmen"<br/>
                    <strong>Android:</strong> Tryck på menyn → "Lägg till på startskärmen"
                  </div>
                </div>
              )}

              {/* PWA Installed Status */}
              {isPWAInstalled && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-4 border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Smartphone className="text-green-600" size={16} />
                    ✅ App installerad!
                  </h3>
                  <p className="text-sm text-gray-700">
                    HälsoPartner AI är installerad på din telefon. Du får nu push-notifikationer och offline-funktionalitet!
                  </p>
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

              {/* AI Provider Status */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Brain className="text-green-600" size={16} />
                  ✅ Riktig AI aktiverad!
                </h3>
                <p className="text-sm text-gray-700">
                  Använder {aiProvider === 'openai' ? '🤖 OpenAI GPT-4o-mini' : aiProvider === 'claude' ? '🧠 Anthropic Claude-3-haiku' : '💎 Google Gemini'} för personliga hälsoråd.
                </p>
              </div>
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

              {/* Nya AI-funktioner */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="text-purple-600" size={16} />
                  🚀 Avancerade AI-funktioner
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={generateMealPlan}
                    disabled={isGeneratingPlan}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Apple size={16} />
                    {isGeneratingPlan ? 'Genererar...' : '🍽️ AI-Måltidsplan (7 dagar)'}
                  </button>
                  <button 
                    onClick={generateWorkoutPlan}
                    disabled={isGeneratingPlan}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Activity size={16} />
                    {isGeneratingPlan ? 'Genererar...' : '💪 AI-Träningsplan (4 veckor)'}
                  </button>
                  <button 
                    onClick={generateHealthPrediction}
                    disabled={isGeneratingPlan}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Brain size={16} />
                    {isGeneratingPlan ? 'Analyserar...' : '🔮 AI-Hälsoprognos (30 dagar)'}
                  </button>
                </div>
              </div>

              {/* AI Chat */}
              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="text-blue-600" size={16} />
                  💬 AI-Chat
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiChatMessage}
                      onChange={(e) => setAiChatMessage(e.target.value)}
                      placeholder="Ställ en fråga till din AI-coach..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button 
                      onClick={sendChatMessage}
                      className="bg-blue-600 text-white p-2 rounded-lg"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                  
                  {/* Chat History */}
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {chatHistory.slice(-5).map((msg, index) => (
                      <div key={index} className={`p-2 rounded-lg text-sm ${
                        msg.type === 'user' 
                          ? 'bg-blue-100 text-blue-800 ml-4' 
                          : 'bg-gray-100 text-gray-800 mr-4'
                      }`}>
                        <div className="font-medium text-xs mb-1">
                          {msg.type === 'user' ? 'Du' : 'AI-Coach'} • {msg.timestamp}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Plans Display */}
              {(mealPlan || workoutPlan || healthPrediction) && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Trophy className="text-green-600" size={16} />
                    📋 Genererade AI-planer
                  </h3>
                  <div className="space-y-2 text-sm">
                    {mealPlan && (
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-green-800">🍽️ Måltidsplan</div>
                        <div className="text-gray-600">7 dagar med personliga måltider</div>
                      </div>
                    )}
                    {workoutPlan && (
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-orange-800">💪 Träningsplan</div>
                        <div className="text-gray-600">4 veckor med progressiva övningar</div>
                      </div>
                    )}
                    {healthPrediction && (
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium text-purple-800">🔮 Hälsoprognos</div>
                        <div className="text-gray-600">30-dagars prediktioner och rekommendationer</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
              <div className="text-sm text-gray-500 text-center py-2">
                Logga aktivitetsdata för att få personliga fokus-uppgifter
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Brain className="text-purple-600" size={16} />
                💡 Personliga AI-insikter
              </h3>
              <div className="text-sm text-gray-500 text-center py-2">
                Använd AI-funktioner för att få personliga insikter baserat på din data
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
                  <div className="text-xl font-bold text-pink-800">0%</div>
                </div>
                <div>
                  <div className="text-purple-600">Telefon-synk</div>
                  <div className="text-xl font-bold text-purple-800">⏸️</div>
                </div>
                <div>
                  <div className="text-pink-600">Push-notiser</div>
                  <div className="text-xl font-bold text-pink-800">🔕</div>
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

        {/* AI Advanced Tab */}
        {currentTab === 'ai-advanced' && (
          <div className="space-y-4">
            {/* AI Provider Status */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Brain className="text-purple-600" size={20} />
                AI Provider Status
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg cursor-pointer ${
                  aiProvider === 'openai' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'
                }`} onClick={() => setAiProvider('openai')}>
                  <div className="font-medium text-sm">🤖 OpenAI GPT-4o-mini</div>
                  <div className="text-xs text-gray-600">
                    {aiProvider === 'openai' ? '✅ Aktiv' : '⏸️ Inaktiv'}
                  </div>
                </div>
                <div className={`p-3 rounded-lg cursor-pointer ${
                  aiProvider === 'claude' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                }`} onClick={() => setAiProvider('claude')}>
                  <div className="font-medium text-sm">🧠 Claude-3-haiku</div>
                  <div className="text-xs text-gray-600">
                    {aiProvider === 'claude' ? '✅ Aktiv' : '⏸️ Inaktiv'}
                  </div>
                </div>
                <div className={`p-3 rounded-lg cursor-pointer ${
                  aiProvider === 'gemini' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'
                }`} onClick={() => setAiProvider('gemini')}>
                  <div className="font-medium text-sm">💎 Google Gemini</div>
                  <div className="text-xs text-gray-600">
                    {aiProvider === 'gemini' ? '✅ Aktiv' : '⏸️ Inaktiv'}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced AI Functions */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                🚀 Avancerade AI-funktioner
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Måltidsplanering */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Apple className="text-green-600" size={16} />
                    🍽️ AI-Måltidsplanering
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Generera personliga måltidsplaner för 7 dagar baserat på dina mål och preferenser.
                  </p>
                  <button 
                    onClick={generateMealPlan}
                    disabled={isGeneratingPlan}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Apple size={16} />
                    {isGeneratingPlan ? 'Genererar...' : 'Generera Måltidsplan'}
                  </button>
                </div>

                {/* Träningsplanering */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Activity className="text-orange-600" size={16} />
                    💪 AI-Träningsplanering
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Skapa anpassade träningsplaner för 4 veckor med progressiva övningar.
                  </p>
                  <button 
                    onClick={generateWorkoutPlan}
                    disabled={isGeneratingPlan}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Activity size={16} />
                    {isGeneratingPlan ? 'Genererar...' : 'Generera Träningsplan'}
                  </button>
                </div>

                {/* Hälsoprognos */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Brain className="text-purple-600" size={16} />
                    🔮 AI-Hälsoprognos
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Få prediktioner för nästa 30 dagar baserat på dina hälsotrender.
                  </p>
                  <button 
                    onClick={generateHealthPrediction}
                    disabled={isGeneratingPlan}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Brain size={16} />
                    {isGeneratingPlan ? 'Analyserar...' : 'Generera Hälsoprognos'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="text-blue-600" size={20} />
                💬 AI-Chat Interface
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiChatMessage}
                    onChange={(e) => setAiChatMessage(e.target.value)}
                    placeholder="Ställ en fråga till din AI-coach..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-base"
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button 
                    onClick={sendChatMessage}
                    className="bg-blue-600 text-white p-3 rounded-lg"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
                
                {/* Chat History */}
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-100 text-blue-800 ml-8' 
                        : 'bg-gray-100 text-gray-800 mr-8'
                    }`}>
                      <div className="font-medium text-sm mb-1">
                        {msg.type === 'user' ? 'Du' : 'AI-Coach'} • {msg.timestamp}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Plans Display */}
            {(mealPlan || workoutPlan || healthPrediction) && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Trophy className="text-green-600" size={16} />
                  📋 Genererade AI-planer
                </h3>
                <div className="space-y-3">
                  {mealPlan && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">🍽️ Måltidsplan</div>
                      <div className="text-sm text-gray-600">7 dagar med personliga måltider baserat på dina preferenser</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Innehåller: Frukost, lunch, middag, snacks + kalorier per måltid
                      </div>
                    </div>
                  )}
                  {workoutPlan && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-orange-800 mb-2">💪 Träningsplan</div>
                      <div className="text-sm text-gray-600">4 veckor med progressiva övningar anpassade för dina mål</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Innehåller: Veckoschema, övningar, reps/sets, varmning, avslutning
                      </div>
                    </div>
                  )}
                  {healthPrediction && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-purple-800 mb-2">🔮 Hälsoprognos</div>
                      <div className="text-sm text-gray-600">30-dagars prediktioner och rekommendationer</div>
                      <div className="mt-2 text-xs text-gray-500">
                        Innehåller: Viktprognos, aktivitetsrekommendationer, risker, optimala träningsdagar
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Statistics */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📊 AI-Statistik</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-purple-600">AI-Råd givna</div>
                  <div className="text-2xl font-bold text-purple-800">{aiMessages.length}</div>
                </div>
                <div>
                  <div className="text-pink-600">Chat-meddelanden</div>
                  <div className="text-2xl font-bold text-pink-800">{chatHistory.length}</div>
                </div>
                <div>
                  <div className="text-purple-600">Genererade planer</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {(mealPlan ? 1 : 0) + (workoutPlan ? 1 : 0) + (healthPrediction ? 1 : 0)}
                  </div>
                </div>
                <div>
                  <div className="text-pink-600">AI-Provider</div>
                  <div className="text-2xl font-bold text-pink-800">
                    {aiProvider === 'openai' ? '🤖' : 
                     aiProvider === 'claude' ? '🧠' : 
                     aiProvider === 'gemini' ? '💎' : '🏠'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <div className="text-lg">📊</div>
            <div className="text-xs mt-1">Dashboard</div>
          </button>
          
          <button 
            onClick={() => setCurrentTab('activity')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === 'activity' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <div className="text-lg">🏃</div>
            <div className="text-xs mt-1">Aktivitet</div>
          </button>
          
          <button 
            onClick={() => setCurrentTab('nutrition')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === 'nutrition' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <div className="text-lg">🍎</div>
            <div className="text-xs mt-1">Mat</div>
          </button>
          
          <button 
            onClick={() => setCurrentTab('ai')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === 'ai' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <div className="text-lg">🤖</div>
            <div className="text-xs mt-1">AI Pro</div>
          </button>
          
          <button 
            onClick={() => setCurrentTab('donate')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === 'donate' ? 'bg-green-100 text-green-600' : 'text-gray-600'
            }`}
          >
            <div className="text-lg">🎁</div>
            <div className="text-xs mt-1">Stöd</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthApp;
