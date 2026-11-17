import { PLACES, type Place } from '../../data/places.ts';
import { CENTER, distanceM } from '../../core/geo.ts';
import { walkDistance, type WalkingProfile } from './paths.ts';
import type { Lang } from '../../core/i18n';

export interface TourStop { id: string; minutes: number; note?: string }
export interface Tour { source: 'llm' | 'offline' | 'shared'; title: string; summary: string; stops: TourStop[]; wantsSunset?: boolean; profile?: WalkingProfile }

const LEX: Record<string, string[]> = {
  food: ['кафе','еда','поесть','кофе','coffee','café','cafe','food','餐饮','咖啡'],
  souvenir: ['сувенир','souvenir','纪念品'],
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
  const quantities: Record<string,string> = {
    один:'1',одну:'1',одна:'1',два:'2',две:'2',три:'3',четыре:'4',пять:'5',шесть:'6',
    one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',一:'1',两:'2',二:'2',三:'3',四:'4',五:'5',六:'6',
  };
  const s = text.toLowerCase().replace(/(один|одну|одна|два|две|три|четыре|пять|шесть|one|two|three|four|five|six|[一两二三四五六])(?=\s*(?:час|минут|hours?|minutes?|个?小时|分钟))/gu,word=>quantities[word]);
  let minutes = 120;
  if (/полтора\s*час|1[.,]5\s*(?:час|ч(?![а-я])|h|hour)|90\s*(?:мин|min)|一个半小时/.test(s)) minutes = 90;
  else if (/пол[- ]?часа|half an hour|half hour|半小时/.test(s)) minutes = 30;
  else {
    const h = /(\d+(?:[.,]\d+)?)\s*(?:часа|часов|час|ч(?![а-я])|hours|hour|hrs|hr|h\b|个小时|小时)/.exec(s);
    const m = /(\d+)\s*(?:мин|min|分钟)/.exec(s);
    if (h) minutes = Math.round(parseFloat(h[1].replace(',', '.')) * 60) + Number(m?.[1] || 0);
    else if (m) minutes = parseInt(m[1], 10);
    else if (/полдня|half a day|半天/.test(s)) minutes = 240;
    else if (/целый день|full day|whole day|一整天/.test(s)) minutes = 360;
  }
  minutes = Math.max(10, Math.min(360, minutes));
  const tags = Object.entries(LEX).filter(([, ws]) => ws.some((w) => s.includes(w))).map(([k]) => k);
  const maxEffort: 0 | 1 | 2 = STRICT_FLAT.some((w) => s.includes(w)) ? 0 : NO_CLIMB.some((w) => s.includes(w)) ? 1 : 2;
  return { minutes, tags, maxEffort, sunset: tags.includes('sunset') };
}

export function tourMetrics(stops: TourStop[], profile: WalkingProfile = 'walk') {
  let meters = 0;
  for (let i = 1; i < stops.length; i++) meters += walkDistance(stops[i-1].id, stops[i].id, profile);
  const visit = stops.reduce((sum, stop) => sum + stop.minutes, 0);
  const walk = Math.ceil(meters / 75);
  return { walk, visit, total: visit + walk, km: meters / 1000 };
}

const firstSentence = (s: string) => { const m = /^[^.!?。]+[.!?。]?/.exec(s); return m ? m[0] : s; };

const T: Record<Lang, { title: (m: number, tags: string) => string; summary: (n: number, total: number, km: string) => string; tagName: Record<string, string>; fallback: string }> = {
  ru: { title: (m, g) => `Прогулка на ~${+(m / 60).toFixed(1)} ч${g ? ': ' + g : ''}`, summary: (n, t, k) => `Остановок: ${n}, около ${t} мин вместе с дорогой, примерно ${k} км пешком. Составлено офлайн-алгоритмом по данным приложения.`, tagName: { food: 'кафе', souvenir: 'сувениры', history: 'история', sunset: 'закат', view: 'виды', walk: 'прогулка', art: 'искусство', family: 'с детьми', architecture: 'архитектура', park: 'парки', religion: 'храмы', water: 'река' }, fallback: 'главное в центре' },
  en: { title: (m, g) => `A ~${+(m / 60).toFixed(1)} h walk${g ? ': ' + g : ''}`, summary: (n, t, k) => `${n} stops, about ${t} min including walking, roughly ${k} km on foot. Built by the offline planner from the app’s own data.`, tagName: { food: 'cafés', souvenir: 'souvenirs', history: 'history', sunset: 'sunset', view: 'views', walk: 'walk', art: 'art', family: 'with kids', architecture: 'architecture', park: 'parks', religion: 'churches', water: 'river' }, fallback: 'centre highlights' },
  zh: { title: (m, g) => `约${+(m / 60).toFixed(1)}小时漫步${g ? '：' + g : ''}`, summary: (n, t, k) => `${n}个站点，含步行约${t}分钟，步行约${k}公里。由离线规划器根据应用自带数据生成。`, tagName: { food: '餐饮', souvenir: '纪念品', history: '历史', sunset: '日落', view: '风景', walk: '漫步', art: '艺术', family: '亲子', architecture: '建筑', park: '公园', religion: '教堂', water: '河景' }, fallback: '市中心精华' },
};

/** Deterministic offline planner: same input => same tour. Works without network or API key. */
export function planOffline(text: string, lang: Lang, l: (v: Place['blurb']) => string, ratings: Record<string, number> = {}): Tour {
  const it = parseIntent(text);
  const tags = it.tags.length ? it.tags : ['history', 'walk'];
  const profile = it.maxEffort === 0 ? 'noSteps' : 'walk';
  const ok = PLACES.filter(p => p.effort <= it.maxEffort);
  const score = (p: Place) => p.tags.filter(tag => tags.includes(tag)).length * 3
    + (ratings[p.id] || 0) + (p.id === 'kremlin' ? 0.4 : 0) - distanceM(CENTER, p) / 40000;
  const ranked = [...ok].sort((a,b) => score(b) - score(a) || a.id.localeCompare(b.id));
  // Build away from the final viewpoint, inserting each stop where it fits the time budget.
  const last = (it.sunset && ranked.find(p => p.sunset)) || ranked[0];
  const stop = (p: Place): TourStop => ({
    id: p.id, minutes: Math.min(it.minutes, p.minutes, 30), note: firstSentence(l(p.blurb)),
  });
  let stops = [stop(last)];
  while (stops.length < 7) {
    let best: TourStop[] | undefined;
    let bestScore = -Infinity;
    for (const p of ranked) {
      if (stops.some(s => s.id === p.id)) continue;
      for (let i = 0; i <= stops.length - (it.sunset ? 1 : 0); i++) {
        const option = [...stops.slice(0, i), stop(p), ...stops.slice(i)];
        const cost = tourMetrics(option, profile);
        const value = score(p) - cost.walk / 10;
        if (cost.total <= it.minutes && value > bestScore) {
          best = option;
          bestScore = value;
        }
      }
    }
    if (!best) break;
    stops = best;
  }
  const m = tourMetrics(stops, profile);
  const tg = T[lang];
  return {
    source: 'offline', wantsSunset: it.sunset, profile,
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
  const profile = maxEffort === 0 ? 'noSteps' : 'walk';
  const m = tourMetrics(stops, profile);
  if (m.total > maxMinutes) return null; // wildly over budget: reject, let the offline planner answer
  return { source: 'llm', profile, title: String(raw.title ?? '').slice(0, 120), summary: String(raw.summary ?? '').slice(0, 400), stops };
}
