import { useEffect, useState } from 'react';

export function useClock(interval: number): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number | undefined;
    function update() {
      window.clearTimeout(timer);
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(update, interval - current.getTime() % interval);
    }

    update();
    window.addEventListener('focus', update);
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      window.removeEventListener('pageshow', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [interval]);

  return now;
}
