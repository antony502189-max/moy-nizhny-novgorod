import { PLACES, type Place } from '../../data/places';
import { CENTER, distanceM } from '../../core/geo';
import type { Lang } from '../../core/i18n';

export interface TourStop { id: string; minutes: number; note?: string }
export interface Tour { source: 'llm' | 'offline' | 'shared'; title: string; summary: string; stops: TourStop[]; wantsSunset?: boolean }

const LEX: Record<string, string[]> = {
  history: ['истори', 'history', 'histor', '历史', 'кремл', 'kremlin', '古'],
  sunset: ['закат', 'sunset', '日落', '夕阳'],
  view: ['вид', 'панорам', 'view', 'scenic', 'panoram', '风景', '观景'],
  walk: ['прогул', 'walk', 'stroll', '散步', 'пешк'],
  art: ['искусств', 'музе', 'art', 'museum', 'gallery', '艺术', '博物'],
  family: ['дет', 'ребен', 'ребён', 'family', 'kid', 'child', '亲子', '孩子'],
  architecture: ['архитект', 'architect', '建筑'],
  park: ['парк', 'сад', 'park', 'garden', '公园', '花园'],
  religion: ['храм', 'церк', 'монастыр', 'church', 'monastery', 'cathedral', '教堂', '修道院'],
  water: ['вод', 'набереж', 'рек', 'волг', 'river', 'embankment', 'volga', '河', '滨河'],
};
const STRICT_FLAT = ['коляск', 'инвалид', 'безбарьер', 'без лестниц', 'не хожу по лестн', 'wheelchair', 'stroller', 'pram', 'step-free', 'no stairs', 'без ступен', '无障碍', '轮椅', '婴儿车', '没有台阶'];
const NO_CLIMB = ['без больш', 'без подъ', 'без крут', 'пожил', 'не уста', 'легк', 'no big climb', 'no climb', 'no steep', 'not steep', 'easy', 'flat', 'avoid hills', 'avoid stairs', 'elderly', '不爬', '别太累', '轻松', '不要爬', '不想爬'];

export interface Intent { minutes: number; tags: string[]; maxEffort: 0 | 1 | 2; sunset: boolean }

export function parseIntent(text: string): Intent {
  const s = text.toLowerCase();
  let minutes = 120;
  if (/полтора\s*час|1[.,]5\s*(?:час|ч\b|h|hour)|90\s*(?:мин|min)|一个半小时/.test(s)) minutes = 90;
  else if (/пол[- ]?часа|half an hour|half hour|半小时/.test(s)) minutes = 30;
  else {
    const h = /(\d+(?:[.,]\d+)?)\s*(?:часа|часов|час|ч\b|hours|hour|hrs|hr|h\b|个小时|小时)/.exec(s);
    const m = /(\d+)\s*(?:мин|min|分钟)/.exec(s);
    if (h) minutes = Math.round(parseFloat(h[1].replace(',', '.')) * 60);
    else if (m) minutes = parseInt(m[1], 10);
    else if (/полдня|half a day|半天/.test(s)) minutes = 240;
    else if (/целый день|full day|whole day|一整天/.test(s)) minutes = 360;
  }
  minutes = Math.max(45, Math.min(360, minutes));
  const tags = Object.entries(LEX).filter(([, ws]) => ws.some((w) => s.includes(w))).map(([k]) => k);
  const maxEffort: 0 | 1 | 2 = STRICT_FLAT.some((w) => s.includes(w)) ? 0 : NO_CLIMB.some((w) => s.includes(w)) ? 1 : 2;
  return { minutes, tags, maxEffort, sunset: tags.includes('sunset') };
}

const walkMin = (a: Place, b: Place) => (distanceM(a, b) * 1.3) / 75; // ~4.5 km/h incl. detours

export function orderNearest(ids: string[], first?: string): string[] {
  const left = ids.map((i) => PLACES.find((p) => p.id === i)!).filter(Boolean);
  if (!left.length) return [];
  let cur = (first && left.find((p) => p.id === first)) || left.reduce((a, b) => (a.lon < b.lon ? a : b)); // start at the western end by default
  const out = [cur];
  left.splice(left.indexOf(cur), 1);
  while (left.length) {
    left.sort((a, b) => distanceM(cur, a) - distanceM(cur, b));
    cur = left.shift()!; out.push(cur);
  }
  return out.map((p) => p.id);
}

export function tourMetrics(stops: TourStop[]) {
  const ps = stops.map((s) => PLACES.find((p) => p.id === s.id)).filter(Boolean) as Place[];
  let walk = 0, dist = 0;
  for (let i = 1; i < ps.length; i++) { walk += walkMin(ps[i - 1], ps[i]); dist += distanceM(ps[i - 1], ps[i]) * 1.3; }
  const visit = stops.reduce((a, s) => a + s.minutes, 0);
  return { walk: Math.round(walk), visit, total: Math.round(walk + visit), km: dist / 1000 };
}

const firstSentence = (s: string) => { const m = /^[^.!?。]+[.!?。]?/.exec(s); return m ? m[0] : s; };

const T: Record<Lang, { title: (m: number, tags: string) => string; summary: (n: number, total: number, km: string) => string; tagName: Record<string, string>; fallback: string }> = {
  ru: { title: (m, g) => `Прогулка на ~${Math.round(m / 30) / 2} ч${g ? ': ' + g : ''}`, summary: (n, t, k) => `Остановок: ${n}, около ${t} мин вместе с дорогой, примерно ${k} км пешком. Составлено офлайн-алгоритмом по данным приложения.`, tagName: { history: 'история', sunset: 'закат', view: 'виды', walk: 'прогулка', art: 'искусство', family: 'с детьми', architecture: 'архитектура', park: 'парки', religion: 'храмы', water: 'река' }, fallback: 'главное в центре' },
  en: { title: (m, g) => `A ~${Math.round(m / 30) / 2} h walk${g ? ': ' + g : ''}`, summary: (n, t, k) => `${n} stops, about ${t} min including walking, roughly ${k} km on foot. Built by the offline planner from the app’s own data.`, tagName: { history: 'history', sunset: 'sunset', view: 'views', walk: 'walk', art: 'art', family: 'with kids', architecture: 'architecture', park: 'parks', religion: 'churches', water: 'river' }, fallback: 'centre highlights' },
  zh: { title: (m, g) => `约${Math.round(m / 30) / 2}小时漫步${g ? '：' + g : ''}`, summary: (n, t, k) => `${n}个站点，含步行约${t}分钟，步行约${k}公里。由离线规划器根据应用自带数据生成。`, tagName: { history: '历史', sunset: '日落', view: '风景', walk: '漫步', art: '艺术', family: '亲子', architecture: '建筑', park: '公园', religion: '教堂', water: '河景' }, fallback: '市中心精华' },
};

/** Deterministic offline planner: same input => same tour. Works without network or API key. */
export function planOffline(text: string, lang: Lang, l: (v: Place['blurb']) => string): Tour {
  const it = parseIntent(text);
  const tags = it.tags.length ? it.tags : ['history', 'walk'];
  const ok = PLACES.filter((p) => p.effort <= it.maxEffort);
  const score = (p: Place) => p.tags.filter((g) => tags.includes(g)).length * 3 + (it.sunset && p.sunset ? 2 : 0) + (p.id === 'kremlin' ? 0.4 : 0) - distanceM(CENTER, p) / 40000;
  let ranked = ok.map((p) => ({ p, s: score(p) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.p.id.localeCompare(b.p.id));
  if (!ranked.length) ranked = ok.map((p) => ({ p, s: 1 }));

  const vis = (p: Place) => Math.min(p.minutes, 30);
  const anchor = ranked[0].p;
  let sunsetPlace: Place | undefined;
  if (it.sunset) {
    const cands = ok.filter((p) => p.sunset);
    sunsetPlace = cands.sort((a, b) => (score(b) - walkMin(anchor, b) / 10) - (score(a) - walkMin(anchor, a) / 10))[0];
  }
  const chosen: Place[] = [anchor];
  if (sunsetPlace && sunsetPlace.id !== anchor.id) chosen.push(sunsetPlace);
  const used = () => chosen.reduce((a, p) => a + vis(p), 0) + (chosen.length > 1 ? walkMin(chosen[0], chosen[chosen.length - 1]) : 0);
  const pool = ranked.map((x) => x.p).filter((p) => !chosen.includes(p));
  while (pool.length && chosen.length < 7) {
    const cands = pool
      .map((p) => ({ p, w: Math.min(...chosen.map((c) => walkMin(c, p))) * 1.6 }))
      .filter(({ p, w }) => used() + vis(p) + w <= it.minutes);
    if (!cands.length) break;
    cands.sort((a, b) => (score(b.p) - b.w / 12) - (score(a.p) - a.w / 12));
    chosen.push(cands[0].p); pool.splice(pool.indexOf(cands[0].p), 1);
  }
  const rest = chosen.filter((p) => p.id !== sunsetPlace?.id);
  let order = orderNearest(rest.map((p) => p.id), anchor.id);
  if (sunsetPlace) order = [...order, sunsetPlace.id];
  // trim stops (lowest score first, never the anchor or the sunset spot) until the real walking time fits the budget
  const fits = (ids: string[]) => tourMetrics(ids.map((id) => ({ id, minutes: vis(PLACES.find((x) => x.id === id)!) }))).total <= it.minutes * 1.15;
  while (order.length > 2 && !fits(order)) {
    const drop = order.filter((id) => id !== anchor.id && id !== sunsetPlace?.id).sort((a, b) => score(PLACES.find((x) => x.id === a)!) - score(PLACES.find((x) => x.id === b)!))[0];
    if (!drop) break;
    order = order.filter((id) => id !== drop);
  }
  const stops: TourStop[] = order.map((id) => {
    const p = PLACES.find((x) => x.id === id)!;
    const note = firstSentence(l(p.blurb));
    return { id, minutes: vis(p), note };
  });
  const m = tourMetrics(stops);
  const tg = T[lang];
  return {
    source: 'offline', wantsSunset: it.sunset,
    title: tg.title(it.minutes, it.tags.map((x) => tg.tagName[x]).filter(Boolean).join(' · ') || tg.fallback),
    summary: tg.summary(stops.length, m.total, m.km.toFixed(1)),
    stops,
  };
}

/** Validate LLM output against the real catalogue; drop unknown ids; fix order if it is absurd. */
export function sanitizeLLM(raw: any, maxMinutes: number, maxEffort: 0 | 1 | 2 = 2): Tour | null {
  if (!raw || !Array.isArray(raw.stops)) return null;
  const seen = new Set<string>();
  const stops: TourStop[] = [];
  for (const s of raw.stops) {
    const p = PLACES.find((x) => x.id === s?.id);
    if (!p || seen.has(p.id) || p.effort > maxEffort) continue; // unknown id, duplicate, or violates the guest's accessibility constraint
    seen.add(p.id);
    stops.push({ id: p.id, minutes: Math.max(5, Math.min(90, Math.round(+s.minutes || p.minutes))), note: typeof s.note === 'string' ? s.note.slice(0, 220) : undefined });
  }
  if (stops.length < 2) return null;
  const m = tourMetrics(stops);
  if (m.total > maxMinutes * 1.6 + 30) return null; // wildly over budget: reject, let the offline planner answer
  return { source: 'llm', title: String(raw.title ?? '').slice(0, 120), summary: String(raw.summary ?? '').slice(0, 400), stops };
}
