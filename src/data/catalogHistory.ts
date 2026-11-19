import type { L10n } from '../core/i18n';
import { places } from '../../resident/domain/data.ts';
import { placeById } from './places.ts';
import type { Credit, HistorySpot } from './history.ts';

export interface CatalogFrame {
  src: string;
  year: number;
  yearLabel?: L10n;
  caption: L10n;
  credit: Credit;
  generated?: boolean;
}

const names: Record<string, [string, string]> = {
  volga: ['Volga Embankment', '伏尔加河滨河路'],
  rowing: ['Rowing Canal Embankment', '赛艇运河滨河路'],
  fedorovsky: ['Fedorovsky Embankment', '费多罗夫斯基滨河路'],
  'kazan-embankment': ['Kazan Embankment', '喀山滨河路'],
  model: ['Scale model of old Nizhny Novgorod', '下诺夫哥罗德古城模型'],
  station: ['Romodanovsky Railway Station', '罗莫达诺夫斯基火车站'],
  barysheva: ['Barysheva House', '巴雷舍娃故居'],
  kozhevnikov: ['Kozhevnikov Estate', '科热夫尼科夫庄园'],
  vyakhirev: ['Vyakhirev Estate', '维亚希列夫庄园'],
  prison: ['Nizhny Novgorod Prison', '下诺夫哥罗德旧监狱'],
  olisov: ['Olisov Chambers', '奥利索夫宅邸'],
  peter: ['Chatygin Chambers (Peter the Great’s House)', '恰特金宅邸（彼得大帝故居）'],
  garden: ['Alexander Garden', '亚历山大花园'],
  shell: ['Rakushka open-air stage', '“贝壳”露天舞台'],
  'sormovo-house': ['Krasnoye Sormovo apartment building', '红索尔莫沃工厂家属楼'],
  gaz: ['GAZ automobile plant', '高尔基汽车厂'],
  'gaz-museum': ['GAZ History Museum', '高尔基汽车厂历史博物馆'],
  sormovo: ['Krasnoye Sormovo shipyard', '红索尔莫沃造船厂'],
  'sormovo-museum': ['Krasnoye Sormovo History Museum', '红索尔莫沃工厂历史博物馆'],
  zachatie: ['Zachatievskaya Tower', '扎恰季耶夫塔'],
  barracks: ['Red Barracks', '红色兵营'],
  mosque: ['Cathedral Mosque', '大清真寺'],
  hero: ['The Hero memorial boat', '“英雄”号纪念船'],
  bell: ['Transfiguration Bell Tower', '显圣容钟楼'],
  walls: ['Kremlin walls', '克里姆林宫城墙'],
  'north-tower': ['North Tower', '北塔'],
  'kazan-church': ['Church of the Kazan Icon', '喀山圣母像教堂'],
  gorky: ['Monument to Maxim Gorky', '马克西姆·高尔基纪念像'],
  shukhov: ['Shukhov tower replicas', '舒霍夫塔仿制景观'],
  church: ['Nativity Church (Stroganov Church)', '圣母诞生教堂（斯特罗加诺夫教堂）'],
  suetinskaya: ['House at 29 Suetinskaya Street', '苏耶京街29号住宅'],
  ski: ['Ski jump at Sennaya Square', '干草广场跳台滑雪场'],
  markin: ['Markin Square', '马尔金广场'],
};

export function catalogHistory(placeId: string, frames: CatalogFrame[]): HistorySpot {
  const place = places.find(p => p.id === placeId);
  if (!place || frames.length !== 4) throw new Error('Incomplete landmark timeline: ' + placeId);
  const guestName = placeById(placeId)?.name;
  const title = { ru: place.title, en: names[placeId]?.[0] ?? guestName?.en, zh: names[placeId]?.[1] ?? guestName?.zh };
  const base = import.meta.env?.BASE_URL || './';
  const then = frames.slice(0, 3).map((frame, i) => ({
    ...frame, src: base + frame.src, id: placeId + '-' + (i + 1),
    yearLabel: frame.yearLabel ?? { ru: String(frame.year), en: String(frame.year), zh: frame.year + '年' },
  }));
  const latest = frames[3];
  return { id: 'place-' + placeId, placeId, title, then, now: { ...latest, src: base + latest.src }, guessExact: false, guessYear: null };
}
