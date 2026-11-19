// Time helpers pinned to Nizhny Novgorod time (UTC+3, no DST).
export const TZ = 'Europe/Moscow';

export function fmtTime(d: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-GB' : 'ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: TZ, hourCycle: 'h23' }).format(d);
}

/** Minutes since local midnight in Nizhny. */
export function minutesOfDay(d: Date): number {
  const local = new Date(d.getTime() + 3 * 3600000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

export function dayKey(d: Date): string {
  return new Date(d.getTime() + 3 * 3600000).toISOString().slice(0, 10);
}
