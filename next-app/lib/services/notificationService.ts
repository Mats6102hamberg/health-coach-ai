// Push Notification Service
export class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  // private vapidPublicKey = 'demo-vapid-key'; // I verkligheten: VAPID key från server

  async initialize() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrerad:', this.registration);
        
        // Lyssna på meddelanden från service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
        
        return true;
      } catch (error) {
        console.error('Fel vid registrering av Service Worker:', error);
        return false;
      }
    }
    return false;
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true
        // applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) // Temporarily disabled for deployment
      });

      // Skicka subscription till server
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Fel vid push-prenumeration:', error);
      return null;
    }
  }

  // Skicka lokala notifikationer
  sendLocalNotification(title: string, options: NotificationOptions = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  }

  // Schemalagda hälsopåminnelser
  scheduleHealthReminders() {
    // Vattenintag - var 2:a timme
    setInterval(() => {
      this.sendLocalNotification('💧 Hydreringstid!', {
        body: 'Dags att dricka ett glas vatten. Håll dig hydrerad för bästa prestanda!',
        tag: 'water-reminder'
      });
    }, 2 * 60 * 60 * 1000); // 2 timmar

    // Rörelse - var 30:e minut om inaktiv
    setInterval(() => {
      this.sendLocalNotification('🚶‍♀️ Rörelsepause!', {
        body: 'Du har suttit still länge. Ta en kort promenad eller stretch!',
        tag: 'movement-reminder'
      });
    }, 30 * 60 * 1000); // 30 minuter

    // Måltidslogg - vid måltider
    this.scheduleMealReminders();
  }

  private scheduleMealReminders() {
    const mealTimes = [
      { hour: 8, minute: 0, meal: 'frukost' },
      { hour: 12, minute: 0, meal: 'lunch' },
      { hour: 18, minute: 0, meal: 'middag' }
    ];

    mealTimes.forEach(({ hour, minute, meal }) => {
      this.scheduleDaily(hour, minute, () => {
        this.sendLocalNotification(`🍽️ ${meal.charAt(0).toUpperCase() + meal.slice(1)}tid!`, {
          body: `Glöm inte att logga din ${meal} för bättre AI-analys!`,
          tag: `meal-${meal}`
        });
      });
    });
  }

  // Schemalägg dagliga notifikationer
  private scheduleDaily(hour: number, minute: number, callback: () => void) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // Om tiden redan passerat idag, schemalägg för imorgon
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilScheduled = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      callback();
      // Upprepa varje dag
      setInterval(callback, 24 * 60 * 60 * 1000);
    }, timeUntilScheduled);
  }

  // Smart notifikationer baserat på användardata
  sendSmartNotifications(userData: any) {
    // Låg aktivitet
    if (userData.steps < 3000 && new Date().getHours() > 14) {
      this.sendLocalNotification('📈 Aktivitetsboost behövs!', {
        body: `Du har ${userData.steps} steg. Sätt på musik och ta en snabb 10-min promenad!`,
      });
    }

    // Viktmål inom räckhåll
    if (userData.weight && userData.targetWeight) {
      const remaining = userData.weight - userData.targetWeight;
      if (remaining < 2 && remaining > 0) {
        this.sendLocalNotification('🎯 Målet är nära!', {
          body: `Bara ${remaining.toFixed(1)}kg kvar! Du är så nära ditt mål!`,
          tag: 'goal-close'
        });
      }
    }

    // Bra progress
    if (userData.weeklyWeightLoss > 0.5) {
      this.sendLocalNotification('🏆 Fantastisk progress!', {
        body: `${userData.weeklyWeightLoss.toFixed(1)}kg ner denna vecka! Fortsätt så här!`,
        tag: 'progress-celebration'
      });
    }
  }

  // AI-drivna notifikationer
  async sendAINotification(aiMessage: string, type: string = 'advice') {
    const icons = {
      motivation: '🌟',
      nutrition: '🍎',
      exercise: '💪',
      advice: '🧠'
    };

    this.sendLocalNotification(`${icons[type as keyof typeof icons]} AI-Coach`, {
      body: aiMessage,
      tag: `ai-${type}`,
      requireInteraction: true,
    });
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
      // Hantera notifikation-klick
      this.handleNotificationAction(event.data.action);
    }
  };

  private handleNotificationAction(action: string) {
    switch (action) {
      case 'start-walk':
        // Starta promenadtimer
        this.startWalkingSession();
        break;
      case 'open-app':
        // Fokusera på appen
        window.focus();
        break;
      case 'get-more':
        // Visa mer AI-råd
        window.dispatchEvent(new CustomEvent('requestMoreAIAdvice'));
        break;
    }
  }

  private startWalkingSession() {
    // Simulera promenadstart
    this.sendLocalNotification('🚶‍♀️ Promenad startad!', {
      body: 'Bra jobbat! Jag spårar din promenad nu.',
      tag: 'walk-started'
    });

    // Uppmuntrande meddelanden under promenad
    setTimeout(() => {
      this.sendLocalNotification('💪 Halvvägs!', {
        body: '5 minuter kvar! Du gör det bra!',
        tag: 'walk-halfway'
      });
    }, 5 * 60 * 1000);

    setTimeout(() => {
      this.sendLocalNotification('🎉 Promenad klar!', {
        body: 'Fantastiskt! +50 extra steg mot ditt mål!',
        tag: 'walk-completed'
      });
    }, 10 * 60 * 1000);
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    // I verkligheten: Skicka till backend
    console.log('Push subscription:', subscription);
    
    // Simulera server-anrop
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.log('Demo mode - subscription sparad lokalt');
    }
  }

  /*
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  */
}
