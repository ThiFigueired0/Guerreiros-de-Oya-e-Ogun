import { useEffect, useRef } from 'react';
import { useStorage } from '../hooks/useStorage';
import { Event, AppSettings } from '../types';
import { isSameDay, parseISO } from 'date-fns';

export function NotificationManager() {
  const [events] = useStorage<Event[]>('templo_events', []);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const notifiedEvents = useRef<Set<string>>(new Set());

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
                body: `Hoje tem: ${event.title} (${event.category})`,
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
