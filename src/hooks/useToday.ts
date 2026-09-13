import { useEffect, useState } from 'react';
import { todayISO } from '@/lib/dates';

/**
 * Today's date-only ISO string, kept fresh so a tab left open overnight re-buckets
 * tasks when the calendar day rolls over.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => todayISO());

  useEffect(() => {
    const sync = () => setToday((prev) => {
      const next = todayISO();
      return next === prev ? prev : next;
    });

    const interval = window.setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  return today;
}
