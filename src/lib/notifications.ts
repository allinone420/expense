// Helper for Browser Notification API & Service Worker local reminders

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  return await Notification.requestPermission();
}

export function showLocalNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notificationOptions = {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-expense-reminder',
    renotify: true,
  };

  // If Service Worker is active, send via SW
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_LOCAL_NOTIFICATION',
      title,
      body,
      icon: '/icon.svg',
    });
  } else {
    // Fallback to standard Notification constructor
    try {
      new Notification(title, notificationOptions);
    } catch (e) {
      console.warn('Direct notification failed:', e);
    }
  }
}

// Scheduled reminder checks (3 times daily)
const REMINDER_MESSAGES = [
  { title: 'খরচ রেকর্ড ট্র্যাকার', body: 'আজকের খরচ যোগ করেছো? (Did you log today\'s expenses?)' },
  { title: 'দৈনিক বাজেট ট্র্যাকার', body: 'আজ কত টাকা খরচ হলো? (How much did you spend today?)' },
  { title: 'ডেইলি এক্সপেন্স রিমাইন্ডার', body: 'দিনের শেষ হিসাবটি মিলিয়ে নাও! (Update your daily expense total!)' },
];

let reminderTimer: number | null = null;

export function setupDailyReminders(enabled: boolean, times: string[] = ['10:00', '14:00', '21:00']) {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
  }

  if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Check every 45 seconds if current time matches any of the target reminder times
  let lastTriggeredMinute = '';

  reminderTimer = window.setInterval(() => {
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (times.includes(currentHHMM) && lastTriggeredMinute !== currentHHMM) {
      lastTriggeredMinute = currentHHMM;
      const index = times.indexOf(currentHHMM) % REMINDER_MESSAGES.length;
      const msg = REMINDER_MESSAGES[index] || REMINDER_MESSAGES[0];
      showLocalNotification(msg.title, msg.body);
    }
  }, 45000);
}
