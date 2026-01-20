/**
 * Health Data API
 *
 * Provides health data integration capabilities.
 * NOTE: Actual AI functionality should be accessed via /api/ai-coach endpoint
 * to ensure API keys are kept server-side.
 */

// Health Data API for device integration
export class HealthDataAPI {
  public isSupported: boolean;

  constructor() {
    this.isSupported =
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  }

  // Returns empty data - actual health data comes from user input or device APIs
  async getSteps(_days = 7): Promise<Array<{date: string, steps: number, calories: number}>> {
    return [];
  }

  async getHeartRate(): Promise<{current: number, resting: number, max: number}> {
    return {
      current: 0,
      resting: 0,
      max: 0
    };
  }

  async getSleepData(_days = 7): Promise<Array<{date: string, duration: number, quality: number, deepSleep: number}>> {
    return [];
  }

  async getWeight() {
    return {
      weight: 0,
      bodyFat: 0,
      muscle: 0,
      timestamp: Date.now()
    };
  }

  async getNutritionData() {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  // Real-time sensor monitoring - requires device API integration
  startHeartRateMonitoring(callback: (heartRate: number) => void) {
    callback(0);
    return () => {};
  }

  /**
   * Food photo analysis
   * NOTE: For production, implement server-side image analysis using
   * Google Cloud Vision API, AWS Rekognition, or similar services.
   * Client-side ML is not recommended for accuracy reasons.
   */
  async analyzeFoodPhoto(_imageFile: File): Promise<{name: string, calories: number, confidence: number} | null> {
    // Return null to indicate no analysis available
    // Actual implementation should call a server-side API endpoint
    console.warn('Food photo analysis requires server-side implementation');
    return null;
  }
}

/**
 * AI Coach API Client
 *
 * IMPORTANT: All AI calls go through the server-side /api/ai-coach endpoint
 * to keep API keys secure. This class is a client for that endpoint.
 */
export class AICoachAPI {
  private apiEndpoint = '/api/ai-coach';

  /**
   * Generate personalized health advice via server-side AI
   */
  async generatePersonalizedAdvice(userData: {
    weight?: number;
    targetWeight?: number;
    steps?: number;
    heartRate?: number;
    sleep?: number;
    calories?: number;
    activityLevel?: string;
    age?: number;
    height?: number;
  }): Promise<{
    message: string;
    type: string;
    timestamp: string;
    priority: string;
    provider: string;
  }> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous', // Will be overridden by server if auth is available
          message: this.buildAdvicePrompt(userData),
          context: userData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI advice');
      }

      const data = await response.json();

      return {
        message: data.response,
        type: 'comprehensive',
        timestamp: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        priority: 'high',
        provider: data.provider,
      };
    } catch (error) {
      console.error('AI Coach error:', error);
      throw error;
    }
  }

  private buildAdvicePrompt(userData: any): string {
    const parts = ['Ge mig personliga hälsoråd baserat på:'];

    if (userData.weight) parts.push(`Vikt: ${userData.weight}kg`);
    if (userData.targetWeight) parts.push(`Målvikt: ${userData.targetWeight}kg`);
    if (userData.steps) parts.push(`Steg idag: ${userData.steps}`);
    if (userData.heartRate) parts.push(`Puls: ${userData.heartRate} bpm`);
    if (userData.sleep) parts.push(`Sömn: ${userData.sleep}h`);
    if (userData.calories) parts.push(`Kalorier: ${userData.calories} kcal`);

    return parts.join('\n');
  }

  /**
   * Chat with Boris AI coach
   */
  async chatWithAI(message: string, context?: any): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          message,
          context,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to chat with AI');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Chat error:', error);
      throw error;
    }
  }

  /**
   * Generate a basic workout plan
   * For advanced plans, use chatWithAI with specific instructions
   */
  async generateBasicWorkoutPlan(userData: { heartRate?: number }): Promise<{
    title: string;
    exercises: Array<{ name: string; duration: string; calories: number }>;
  }> {
    const { heartRate = 70 } = userData;

    let intensity = 'moderate';
    if (heartRate < 60) intensity = 'high';
    if (heartRate > 80) intensity = 'low';

    const plans: Record<string, { title: string; exercises: Array<{ name: string; duration: string; calories: number }> }> = {
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
}
