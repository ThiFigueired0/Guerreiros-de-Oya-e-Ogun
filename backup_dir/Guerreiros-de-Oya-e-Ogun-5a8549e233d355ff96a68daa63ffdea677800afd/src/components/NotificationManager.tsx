import { useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { Event, AppSettings, NotificationItem } from '../types';
import { isSameDay, parseISO } from 'date-fns';

export function NotificationManager() {
  const [events] = useStorage<Event[]>('templo_events', []);
  const [notifications] = useStorage<NotificationItem[]>('templo_history', []);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const notifiedEvents = useRef<Set<string>>(new Set());
  const notifiedIds = useRef<Set<string>>(new Set(notifications.map(n => n.id)));

  // Request permission when toggled on
  useEffect(() => {
    if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.pushNotifications]);

  // Listen for newly added system notifications
  useEffect(() => {
    if (!settings.pushNotifications || !('Notification' in window) || Notification.permission !== 'granted') return;

    notifications.forEach(notif => {
      if (!notifiedIds.current.has(notif.id)) {
        notifiedIds.current.add(notif.id);
        const timeDiff = Date.now() - notif.timestamp;
        // Only show native notification if it's recent (e.g. last 10 seconds)
        // to avoid spamming old notifications on full reload
        if (timeDiff < 10000) {
          const title = notif.category === 'adição' ? 'Novo Item' : 
                        notif.category === 'edição' ? 'Atualização' : 
                        notif.category === 'remoção' ? 'Item Removido' : 
                        'Templo Dashboard';
          new Notification(title, {
            body: notif.title,
            icon: '/vite.svg'
          });
        }
      }
    });

    // Also update Set size to prevent memory leaks over time
    if (notifiedIds.current.size > 200) {
      const recentIds = notifications.slice(0, 100).map(n => n.id);
      notifiedIds.current = new Set(recentIds);
    }
  }, [notifications, settings.pushNotifications]);

  // Legacy Daily Event reminders
  useEffect(() => {
    if (!settings.pushNotifications) return;

    const checkReminders = () => {
      const today = new Date();
      // Only notify if it's after 00:01 today
      const now = new Date();
      const isAfterMidnight = now.getHours() > 0 || (now.getHours() === 0 && now.getMinutes() >= 1);
      
      if (!isAfterMidnight) return;

      events.forEach((event: Event) => {
        if (isSameDay(parseISO(event.date), today)) {
          if (!notifiedEvents.current.has(event.id)) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Lembrete de Evento', {
                body: `Hoje tem: ${event.title || event.reminder} (${event.category})`,
                icon: '/vite.svg'
              });
              notifiedEvents.current.add(event.id);
            }
          }
        }
      });
    };

    // Check every minute to catch the 00:01 window as accurately as possible within current runtime constraints
    checkReminders();
    const interval = setInterval(checkReminders, 60000); 

    return () => clearInterval(interval);
  }, [events, settings.pushNotifications]);

  return null;
}
