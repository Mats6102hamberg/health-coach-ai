// Health Data API simulation
export class HealthDataAPI {
  public isSupported: boolean;

  constructor() {
    this.isSupported =
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  }

  // Simulera Apple Health / Google Fit data
  async getSteps(_days = 7): Promise<Array<{date: string, steps: number, calories: number}>> {
    // Returnera tom data - ingen simulering
    return [];
  }

  async getHeartRate(): Promise<{current: number, resting: number, max: number}> {
    // Returnera tom data - ingen simulering
    return {
      current: 0,
      resting: 0,
      max: 0
    };
  }

  async getSleepData(_days = 7): Promise<Array<{date: string, duration: number, quality: number, deepSleep: number}>> {
    // Returnera tom data - ingen simulering
    return [];
  }

  async getWeight() {
    // Returnera tom data - ingen simulering
    return {
      weight: 0,
      bodyFat: 0,
      muscle: 0,
      timestamp: Date.now()
    };
  }

  async getNutritionData() {
    // Returnera tom data - ingen simulering
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  // Real-time sensor data
  startHeartRateMonitoring(callback: (heartRate: number) => void) {
    // Ingen simulering - returnera 0
    callback(0);
    return () => {}; // Tom cleanup funktion
  }

  // Kamera för matfoto-igenkänning
  async analyzeFoodPhoto(_imageFile: File) {
    // I verkligheten: Google Cloud Vision API eller TensorFlow.js
    const foods = [
      { name: 'Äpple', calories: 95, confidence: 0.9 },
      { name: 'Banan', calories: 105, confidence: 0.85 },
      { name: 'Sallad', calories: 50, confidence: 0.8 },
      { name: 'Pizza', calories: 400, confidence: 0.75 }
    ];
    
    // Simulera AI-analys
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return foods[Math.floor(Math.random() * foods.length)];
  }
}

// AI Coach API - Enhanced with multiple providers and advanced features
export class AICoachAPI {
  private openaiKey: string;
  private claudeKey: string;
  private geminiKey: string;
  private openaiURL: string;
  private claudeURL: string;
  private geminiURL: string;

  constructor() {
    this.openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    this.claudeKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
    this.geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.openaiURL = 'https://api.openai.com/v1';
    this.claudeURL = 'https://api.anthropic.com/v1';
    this.geminiURL = 'https://generativelanguage.googleapis.com/v1beta';
  }

  // Kolla vilken AI-provider som är aktiv
  getAIProvider(): 'openai' | 'claude' | 'gemini' {
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const claudeKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    // Kolla om nyckeln är riktig (inte placeholder)
    if (openaiKey && openaiKey !== 'your_openai_api_key_here' && openaiKey.startsWith('sk-proj-')) {
      return 'openai';
    }
    
    if (claudeKey && claudeKey !== 'your_claude_api_key_here' && claudeKey.startsWith('sk-ant-')) {
      return 'claude';
    }
    
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      return 'gemini';
    }
    
    return 'openai';
  }

  async generatePersonalizedAdvice(userData: any) {
    const provider = this.getAIProvider();
    
    try {
      // Försök med riktig OpenAI först
      if (provider === 'openai') {
        console.log('🤖 Använder OpenAI GPT-4o-mini för AI-analys...');
        const advice = await this.callOpenAI(userData);
        return { ...advice, provider: 'openai' };
      } 
      
      // Försök med Claude som backup
      if (provider === 'claude') {
        console.log('🧠 Använder Claude för AI-analys...');
        const advice = await this.callClaude(userData, this.claudeKey);
        return { ...advice, provider: 'claude' };
      }
      
      // Försök med Gemini
      if (provider === 'gemini') {
        console.log('💎 Använder Google Gemini för AI-analys...');
        const advice = await this.callGemini(userData, this.geminiKey);
        return { ...advice, provider: 'gemini' };
      }
      
      // Demo-läge
      console.log('� Demo-mode: Lägg till VITE_OPENAI_API_KEY i .env för riktig AI');
      const advice = this.generateLocalAdvice(userData);
      return { ...advice, provider: 'demo' };
      
    } catch (error) {
      console.error('❌ AI API fel:', error);
      
      // Fallback till lokala AI-råd
      console.log('🏠 Använder lokala AI-råd som fallback');
      const advice = this.generateLocalAdvice(userData);
      return { ...advice, provider: 'demo' };
    }
  }

  // Google Gemini API
  async callGemini(userData: any, apiKey: string) {
    const prompt = `Du är en expert hälsocoach. Analysera denna data och ge 2-3 personliga råd på svenska med emoji:

Vikt: ${userData.weight}kg (mål: ${userData.targetWeight}kg)
Steg: ${userData.steps}, Puls: ${userData.heartRate} bpm
Sömn: ${userData.sleep}h, Kalorier: ${userData.calories} kcal

Ge konkreta, uppmuntrande råd. Max 150 ord.`;

    const response = await fetch(`${this.geminiURL}/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API fel: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates[0].content.parts[0].text;

    return {
      message: aiMessage,
      type: 'comprehensive',
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      priority: 'high',
      source: 'gemini-pro',
      provider: 'gemini'
    };
  }

  // Lägg till Claude API som backup
  async callClaude(userData: any, apiKey: string) {
    const prompt = `Du är en expert hälsocoach. Analysera denna data och ge 2-3 personliga råd på svenska med emoji:

Vikt: ${userData.weight}kg (mål: ${userData.targetWeight}kg)
Steg: ${userData.steps}, Puls: ${userData.heartRate} bpm
Sömn: ${userData.sleep}h, Kalorier: ${userData.calories} kcal

Ge konkreta, uppmuntrande råd. Max 150 ord.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API fel: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.content[0].text;

    return {
      message: aiMessage,
      type: 'comprehensive',
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      priority: 'high',
      source: 'claude-3-haiku',
      provider: 'claude'
    };
  }

  async callOpenAI(userData: any) {
    const prompt = `Du är en professionell hälso- och träningscoach med expertis inom nutrition, träning och beteendeförändring. 

Analysera denna användardata och ge personliga, actionable råd på svenska:

📊 ANVÄNDARDATA:
- Vikt: ${userData.weight}kg (målvikt: ${userData.targetWeight}kg)
- Steg idag: ${userData.steps}
- Vilopuls: ${userData.heartRate} bpm
- Sömn senaste natten: ${userData.sleep} timmar
- Kaloriintag idag: ${userData.calories} kcal
- Aktivitetsnivå: ${userData.activityLevel}
- Ålder: ${userData.age || 35} år
- Längd: ${userData.height || 175} cm

INSTRUKTIONER:
1. Ge 2-3 konkreta, personliga råd baserat på datan
2. Använd emoji för att göra det engagerande
3. Fokusera på det mest viktiga för användarens mål
4. Var uppmuntrande men realistisk
5. Max 150 ord
6. Inkludera specifika siffror när relevant

Svara endast med råden, ingen förklaring av uppgiften.`;

    const response = await fetch(this.openaiURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Billigare modell, ändra till 'gpt-4' för bästa kvalitet
        messages: [
          {
            role: 'system',
            content: 'Du är en expert hälsocoach som ger personliga, actionable råd på svenska med emoji.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API fel: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Ogiltigt svar från OpenAI API');
    }

    const aiMessage = data.choices[0].message.content.trim();

    return {
      message: aiMessage,
      type: 'comprehensive',
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      priority: 'high',
      source: 'openai-gpt4',
      provider: 'openai'
    };
  }

  generateLocalAdvice(userData: any) {
    const advice: string[] = [];
    
    // Viktanalys
    if (userData.weight > userData.targetWeight) {
      const deficit = (userData.weight - userData.targetWeight) * 7700; // kalorier
      advice.push(`🎯 Du har ${(userData.weight - userData.targetWeight).toFixed(1)}kg kvar! Skapa ett underskott på ${Math.round(deficit/7)} kcal/dag för 1kg/vecka.`);
    }
    
    // Aktivitetsanalys
    if (userData.steps < 8000) {
      advice.push(`🚶‍♀️ Öka din dagliga aktivitet! Försök nå 10,000 steg - du är ${8000 - userData.steps} steg från att vara i "aktiv" zonen.`);
    } else if (userData.steps > 12000) {
      advice.push(`🔥 Fantastiska ${userData.steps} steg! Du bränner extra ${Math.round((userData.steps - 10000) * 0.04)} kcal bara genom din höga aktivitet!`);
    }
    
    // Hjärtfrekvensanalys
    if (userData.heartRate > 100) {
      advice.push(`❤️ Hög vilopuls (${userData.heartRate}). Fokusera på stresshantering och se till att få tillräckligt med sömn.`);
    } else if (userData.heartRate < 60) {
      advice.push(`💪 Excellent vilopuls ${userData.heartRate}! Din kondition är tydligen mycket bra!`);
    }
    
    // Sömnanalys
    if (userData.sleep > 0 && userData.sleep < 7) {
      advice.push(`😴 ${userData.sleep}h sömn påverkar viktminskning negativt. Sikta på 7-9h för optimal återhämtning och hormonbalans.`);
    }
    
    // Slumpmässigt motivationsmeddelande
    const motivational = [
      `🌟 Varje liten förändring räknas! Du bygger hälsosamma vanor för livet.`,
      `💎 Konsistens är nyckeln - du gör fantastiskt bra ifrån dig!`,
      `🎯 Dina mål är inom räckhåll! Fortsätt med det fantastiska arbetet.`,
      `⚡ Din kropp anpassar sig - ge den tid att visa resultaten!`
    ];
    
    advice.push(motivational[Math.floor(Math.random() * motivational.length)]);
    
    return {
      message: advice.join(' '),
      type: 'comprehensive',
      timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      priority: 'high',
      provider: 'demo'
    };
  }

  async generateBasicWorkoutPlan(userData: any) {
    const { heartRate } = userData;
    
    let intensity = 'moderate';
    if (heartRate < 60) intensity = 'high';
    if (heartRate > 80) intensity = 'low';
    
    const plans: Record<string, any> = {
      low: {
        title: 'Gentle Start Program',
        exercises: [
          { name: '10 min promenad', duration: '10 min', calories: 50 },
          { name: 'Stretching', duration: '5 min', calories: 20 },
          { name: 'Djupandning', duration: '5 min', calories: 10 }
        ]
      },
      moderate: {
        title: 'Balanced Fitness',
        exercises: [
          { name: '20 min snabb promenad', duration: '20 min', calories: 120 },
          { name: 'Bodyweight squats', duration: '5 min', calories: 40 },
          { name: 'Plank', duration: '2 min', calories: 20 }
        ]
      },
      high: {
        title: 'Power Training',
        exercises: [
          { name: '15 min löpning', duration: '15 min', calories: 180 },
          { name: 'HIIT-pass', duration: '10 min', calories: 120 },
          { name: 'Styrketräning', duration: '20 min', calories: 100 }
        ]
      }
    };
    
    return plans[intensity];
  }

  // AI-driven måltidsplanering
  async generateMealPlan(userData: any, preferences: string[] = []) {
    const provider = this.getAIProvider();
    
    const prompt = `Skapa en personlig måltidsplan för 7 dagar på svenska:

Användardata:
- Vikt: ${userData.weight}kg (mål: ${userData.targetWeight}kg)
- Kalorier: ${userData.calories} kcal/dag
- Aktivitetsnivå: ${userData.activityLevel}
- Preferenser: ${preferences.join(', ') || 'ingen'}

Skapa:
1. Frukost, lunch, middag för varje dag
2. Snacks (2-3 per dag)
3. Kalorier per måltid
4. Näringsfokus (protein, kolhydrater, fett)
5. Enkla recept med ingredienser

Formatera som JSON med dagar som nycklar.`;

    try {
      if (provider === 'openai') {
        return await this.callOpenAIForMealPlan(prompt);
      } else if (provider === 'claude') {
        return await this.callClaudeForMealPlan(prompt);
      } else if (provider === 'gemini') {
        return await this.callGeminiForMealPlan(prompt);
      } else {
        return this.generateLocalMealPlan(userData, preferences);
      }
    } catch (error) {
      console.error('Meal plan generation failed:', error);
      return this.generateLocalMealPlan(userData, preferences);
    }
  }

  // AI-driven träningsplan
  async generateWorkoutPlan(userData: any, equipment: string[] = []) {
    const provider = this.getAIProvider();
    
    const prompt = `Skapa en personlig träningsplan för 4 veckor på svenska:

Användardata:
- Vikt: ${userData.weight}kg (mål: ${userData.targetWeight}kg)
- Aktivitetsnivå: ${userData.activityLevel}
- Hjärtfrekvens: ${userData.heartRate} bpm
- Utrustning: ${equipment.join(', ') || 'kroppsvikt'}

Skapa:
1. Veckoschema med träningsdagar
2. Specifika övningar med reps/sets
3. Progressiv överbelastning
4. Varmning och avslutning
5. Rest days och recovery

Formatera som JSON med veckor som nycklar.`;

    try {
      if (provider === 'openai') {
        return await this.callOpenAIForWorkout(prompt);
      } else if (provider === 'claude') {
        return await this.callClaudeForWorkout(prompt);
      } else if (provider === 'gemini') {
        return await this.callGeminiForWorkout(prompt);
      } else {
        return this.generateLocalWorkoutPlan(userData, equipment);
      }
    } catch (error) {
      console.error('Workout plan generation failed:', error);
      return this.generateLocalWorkoutPlan(userData, equipment);
    }
  }

  // Prediktiv hälsoanalys
  async generateHealthPrediction(userData: any, historicalData: any[]) {
    const provider = this.getAIProvider();
    
    const prompt = `Analysera hälsotrender och ge prediktioner för nästa 30 dagar:

Nuvarande data:
- Vikt: ${userData.weight}kg (mål: ${userData.targetWeight}kg)
- Steg: ${userData.steps}/dag
- Hjärtfrekvens: ${userData.heartRate} bpm
- Sömn: ${userData.sleep}h/natt

Historisk data (senaste 30 dagar):
${historicalData.map(d => `- ${d.date}: ${d.weight}kg, ${d.steps}steg, ${d.calories}kcal`).join('\n')}

Ge:
1. Viktprognos för nästa 30 dagar
2. Aktivitetsrekommendationer
3. Potentiella risker eller utmaningar
4. Optimala träningsdagar
5. Näringsjusteringar

Svara på svenska med emoji.`;

    try {
      if (provider === 'openai') {
        return await this.callOpenAIForPrediction(prompt);
      } else if (provider === 'claude') {
        return await this.callClaudeForPrediction(prompt);
      } else if (provider === 'gemini') {
        return await this.callGeminiForPrediction(prompt);
      } else {
        return this.generateLocalPrediction(userData, historicalData);
      }
    } catch (error) {
      console.error('Health prediction failed:', error);
      return this.generateLocalPrediction(userData, historicalData);
    }
  }

  // AI-chatbot för interaktiv coaching
  async chatWithAI(message: string, context: any) {
    const provider = this.getAIProvider();
    
    const prompt = `Du är en personlig hälsocoach. Svara på användarens fråga baserat på deras data:

Användardata:
- Vikt: ${context.weight}kg (mål: ${context.targetWeight}kg)
- Steg: ${context.steps}
- Hjärtfrekvens: ${context.heartRate} bpm
- Sömn: ${context.sleep}h

Användarens fråga: "${message}"

Svara personligt, uppmuntrande och konkret på svenska med emoji. Max 200 ord.`;

    try {
      if (provider === 'openai') {
        return await this.callOpenAIForChat(prompt);
      } else if (provider === 'claude') {
        return await this.callClaudeForChat(prompt);
      } else if (provider === 'gemini') {
        return await this.callGeminiForChat(prompt);
      } else {
        return this.generateLocalChatResponse(message, context);
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      return this.generateLocalChatResponse(message, context);
    }
  }

  // Helper methods for different AI providers
  async callOpenAIForMealPlan(prompt: string) {
    const response = await fetch(this.openaiURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async callClaudeForMealPlan(prompt: string) {
    const response = await fetch(this.claudeURL + '/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.claudeKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.content[0].text);
  }

  async callGeminiForMealPlan(prompt: string) {
    const response = await fetch(`${this.geminiURL}/models/gemini-pro:generateContent?key=${this.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }

  // Similar methods for workout plans, predictions, and chat
  async callOpenAIForWorkout(prompt: string) {
    return this.callOpenAIForMealPlan(prompt); // Same structure
  }

  async callClaudeForWorkout(prompt: string) {
    return this.callClaudeForMealPlan(prompt);
  }

  async callGeminiForWorkout(prompt: string) {
    return this.callGeminiForMealPlan(prompt);
  }

  async callOpenAIForPrediction(prompt: string) {
    return this.callOpenAIForMealPlan(prompt);
  }

  async callClaudeForPrediction(prompt: string) {
    return this.callClaudeForMealPlan(prompt);
  }

  async callGeminiForPrediction(prompt: string) {
    return this.callGeminiForMealPlan(prompt);
  }

  async callOpenAIForChat(prompt: string) {
    const response = await fetch(this.openaiURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callClaudeForChat(prompt: string) {
    const response = await fetch(this.claudeURL + '/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.claudeKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
    const data = await response.json();
    return data.content[0].text;
  }

  async callGeminiForChat(prompt: string) {
    const response = await fetch(`${this.geminiURL}/models/gemini-pro:generateContent?key=${this.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Local fallback methods
  generateLocalMealPlan(_userData: any, _preferences: string[]) {
    return {
      monday: {
        breakfast: { name: "Havregrynsgröt med bär", calories: 320, protein: 15 },
        lunch: { name: "Kycklingsallad", calories: 450, protein: 35 },
        dinner: { name: "Fisk med grönsaker", calories: 380, protein: 40 },
        snacks: ["Äpple", "Nötter"]
      },
      // ... more days
    };
  }

  generateLocalWorkoutPlan(_userData: any, _equipment: string[]) {
    return {
      week1: {
        monday: { exercises: ["Squats", "Push-ups", "Plank"], duration: "30 min" },
        wednesday: { exercises: ["Lunges", "Dips", "Mountain climbers"], duration: "30 min" },
        friday: { exercises: ["Burpees", "Jumping jacks", "Wall sit"], duration: "30 min" }
      }
      // ... more weeks
    };
  }

  generateLocalPrediction(_userData: any, _historicalData: any[]) {
    return {
      weightPrediction: "Förväntad viktminskning: 1.2kg nästa månad",
      recommendations: ["Öka proteinintaget", "Lägg till styrketräning"],
      risks: ["Risk för platå om inte träning varieras"],
      optimalDays: ["Måndag", "Onsdag", "Fredag"]
    };
  }

  generateLocalChatResponse(_message: string, _context: any) {
    const responses = [
      "Bra fråga! Baserat på din data skulle jag rekommendera...",
      "Jag ser att du har gjort bra framsteg! För att fortsätta...",
      "Det låter som en utmaning. Låt mig ge dig några tips...",
      "Perfekt timing för den frågan! Här är mina råd..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
