// Local solar position (Meeus-style low-precision formulas, ~1 min accuracy). No network, no deps.
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export interface SunPos { elevation: number; azimuth: number } // degrees; azimuth clockwise from north

export function sunPosition(date: Date, lat: number, lon: number): SunPos {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = rad((357.528 + 0.9856003 * n) % 360);
  const lambda = rad(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const eps = rad(23.439 - 0.0000004 * n);
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const H = rad(gmst * 15 + lon) - ra;
  const la = rad(lat);
  const elevation = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
  const azimuth = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(dec) * Math.cos(la)) + Math.PI;
  return { elevation: deg(elevation), azimuth: (deg(azimuth) + 360) % 360 };
}

/** Moment (in ms) when elevation crosses `target` between a and b (a<b). */
function bisect(f: (t: number) => number, a: number, b: number): number {
  for (let i = 0; i < 30; i++) {
    const m = (a + b) / 2;
    if (f(a) * f(m) <= 0) b = m; else a = m;
  }
  return (a + b) / 2;
}

export interface SunDay {
  sunrise: Date | null; sunset: Date | null; goldenStart: Date | null; sunsetAzimuth: number | null;
}

/** Sunset etc. for the calendar day of `ref` in UTC+3 (Nizhny Novgorod). */
export function sunDay(ref: Date, lat: number, lon: number): SunDay {
  const offset = 3 * 3600000;
  const local = new Date(ref.getTime() + offset);
  const dayStartUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offset;
  const el = (t: number) => sunPosition(new Date(t), lat, lon).elevation;
  let sunrise: number | null = null, sunset: number | null = null, golden: number | null = null;
  const step = 5 * 60000;
  for (let t = dayStartUtc; t < dayStartUtc + 86400000; t += step) {
    const a = el(t) + 0.833, b = el(t + step) + 0.833;
    if (a < 0 && b >= 0 && sunrise === null) sunrise = bisect((x) => el(x) + 0.833, t, t + step);
    if (a >= 0 && b < 0) sunset = bisect((x) => el(x) + 0.833, t, t + step);
    const ga = el(t) - 6, gb = el(t + step) - 6;
    if (ga >= 0 && gb < 0) golden = bisect((x) => el(x) - 6, t, t + step);
  }
  return {
    sunrise: sunrise ? new Date(sunrise) : null,
    sunset: sunset ? new Date(sunset) : null,
    goldenStart: golden ? new Date(golden) : null,
    sunsetAzimuth: sunset ? sunPosition(new Date(sunset), lat, lon).azimuth : null,
  };
}

export function compass(az: number, lang: 'ru' | 'en' | 'zh' = 'ru'): string {
  const names = {
    ru: ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'],
    en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    zh: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'],
  }[lang];
  return names[Math.round(az / 45) % 8];
}
