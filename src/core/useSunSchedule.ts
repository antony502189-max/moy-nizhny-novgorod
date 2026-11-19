import { useMemo } from 'react';
import { type LatLon } from './geo';
import { sunDay } from './sun';
import { dayKey } from './time';

export function useSunSchedule(now: Date, { lat, lon }: LatLon) {
  const day = dayKey(now);
  return useMemo(() => {
    const date = new Date(day);
    const today = sunDay(date, lat, lon);
    date.setUTCDate(date.getUTCDate() + 1);
    return { today, tomorrow: sunDay(date, lat, lon) };
  }, [day, lat, lon]);
}
