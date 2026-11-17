import type { L10n } from '../core/i18n';
import programme from './events.json' with { type: 'json' };

export interface CityEvent {
  id: string; placeId: string; start: string; title: L10n; source: string;
}
export const edition = programme.checked;
export const EVENTS: CityEvent[] = programme.events;
export function upcomingEvents(now: Date, events = EVENTS) {
  const time = now.getTime();
  const future = events.filter(e => Date.parse(e.start) >= time).sort((a,b) => Date.parse(a.start) - Date.parse(b.start));
  const soon = future.filter(e => Date.parse(e.start) <= time + 3 * 3600000);
  return { list: soon.length ? soon : future.slice(0,3), soon: soon.length > 0 };
}
