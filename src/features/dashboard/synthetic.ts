import { districtOf } from '../../core/geo';
import type { Report } from '../report/store';

/**
 * SYNTHETIC DEMO DATA. Deterministic (seeded) so the dashboard looks the same on every device.
 * It is generated from hotspots around well-known tourist places and has NO connection to real city appeals.
 */
function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const HOT: { lat: number; lon: number; w: number; cats: Record<string, number> }[] = [
  { lat: 56.3304, lon: 44.0094, w: 5, cats: { toilet: 5, water: 3, stepfree: 5, pavement: 1, lighting: 2 } }, // Chkalov stairs
  { lat: 56.3280, lon: 44.0021, w: 4, cats: { toilet: 3, signage: 4, stepfree: 3, water: 2 } },               // Kremlin
  { lat: 56.3163, lon: 43.9938, w: 4, cats: { cleanliness: 3, pavement: 3, toilet: 2, signage: 2 } },         // Pokrovskaya
  { lat: 56.3330, lon: 43.9742, w: 3, cats: { toilet: 4, water: 4, lighting: 3 } },                           // Strelka
  { lat: 56.3289, lon: 43.9617, w: 3, cats: { transport: 3, signage: 3, toilet: 2 } },                         // Fair
  { lat: 56.3316, lon: 44.0100, w: 3, cats: { cleanliness: 2, lighting: 3, water: 3, safety: 1 } },            // Lower Volga emb.
  { lat: 56.3238, lon: 44.0391, w: 2, cats: { transport: 3, toilet: 2, signage: 2 } },                         // Cable car
  { lat: 56.3162, lon: 43.9710, w: 2, cats: { transport: 4, signage: 3, pavement: 2 } },                       // Station area
  { lat: 56.2900, lon: 43.9750, w: 1, cats: { pavement: 3, lighting: 2, other: 2 } },
  { lat: 56.2450, lon: 43.8750, w: 1, cats: { pavement: 2, transport: 2, other: 2 } },
  { lat: 56.3600, lon: 43.8650, w: 1, cats: { pavement: 2, cleanliness: 2, other: 1 } },
];
const LANG_W: [Report['lang'], number][] = [['ru', 0.58], ['en', 0.27], ['zh', 0.15]];
const SAMPLE: Record<string, Record<Report['lang'], string>> = {
  toilet: { ru: 'Не нашёл туалет рядом', en: 'Could not find a toilet nearby', zh: '附近找不到厕所' },
  water: { ru: 'Нет питьевой воды', en: 'No drinking water here', zh: '这里没有饮用水' },
  stepfree: { ru: 'С коляской не пройти', en: 'No way through with a stroller', zh: '推婴儿车过不去' },
  signage: { ru: 'Нет указателей на английском', en: 'No signs in English', zh: '没有中文/英文指示' },
};

export function syntheticReports(now = Date.now(), n = 420): Report[] {
  const r = rng(20261121);
  const out: Report[] = [];
  const total = HOT.reduce((a, h) => a + h.w, 0);
  for (let i = 0; i < n; i++) {
    let x = r() * total, h = HOT[0];
    for (const c of HOT) { if ((x -= c.w) <= 0) { h = c; break; } }
    const cw = Object.entries(h.cats); const ct = cw.reduce((a, [, w]) => a + w, 0);
    let y = r() * ct, cat = cw[0][0];
    for (const [k, w] of cw) { if ((y -= w) <= 0) { cat = k; break; } }
    const lat = h.lat + (r() - 0.5) * 0.006, lon = h.lon + (r() - 0.5) * 0.011;
    let z = r(), lang: Report['lang'] = 'ru';
    for (const [lg, w] of LANG_W) { if ((z -= w) <= 0) { lang = lg; break; } }
    const day = Math.floor(Math.pow(r(), 1.3) * 30); // more recent => more reports
    const ts = now - day * 86400000 - Math.floor(r() * 86400000);
    out.push({ id: 'DEMO-' + i, ts, cat, text: SAMPLE[cat]?.[lang] ?? '', lat, lon, lang, district: districtOf({ lat, lon }), synthetic: true });
  }
  return out;
}
