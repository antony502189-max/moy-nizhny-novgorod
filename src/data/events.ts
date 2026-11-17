import type { L10n } from '../core/i18n';

/**
 * DEMO DATA — NOT a real city programme. Titles and times are invented placeholders to show the "Now" screen.
 * Venues are real places from places.ts. Replace with the real «Афиша» feed (see README → "Replacing demo data").
 * Each event repeats daily at `start` (HH:MM, Nizhny time) so the demo always has something in the next ~3 hours.
 */
export interface CityEvent {
  id: string; placeId: string; start: string; durationMin: number; kind: 'tour' | 'music' | 'expo' | 'family' | 'walk';
  title: L10n; free?: boolean; demo: true;
}

export const EVENTS: CityEvent[] = [
  { id: 'e1', placeId: 'kremlin', start: '10:00', durationMin: 90, kind: 'tour', title: { ru: 'Обзорная экскурсия по кремлю', en: 'Kremlin overview tour', zh: '克里姆林宫导览' }, demo: true },
  { id: 'e2', placeId: 'art', start: '11:30', durationMin: 120, kind: 'expo', title: { ru: 'Экспозиция современного искусства', en: 'Contemporary art exhibition', zh: '当代艺术展' }, demo: true },
  { id: 'e3', placeId: 'pokrovskaya', start: '12:00', durationMin: 90, kind: 'walk', title: { ru: 'Пешая прогулка «Большая Покровская»', en: 'Walking tour “Bolshaya Pokrovskaya”', zh: '“大波克罗夫卡街”徒步', }, free: true, demo: true },
  { id: 'e4', placeId: 'garden', start: '14:00', durationMin: 60, kind: 'family', title: { ru: 'Семейный час в Александровском саду', en: 'Family hour in the Alexander Garden', zh: '亚历山大花园亲子时光' }, free: true, demo: true },
  { id: 'e5', placeId: 'warehouses', start: '15:30', durationMin: 120, kind: 'expo', title: { ru: 'Выставка на Стрелке', en: 'Exhibition on the Strelka', zh: '斯特列尔卡展览' }, demo: true },
  { id: 'e6', placeId: 'garden', start: '17:00', durationMin: 90, kind: 'music', title: { ru: 'Открытый концерт на «Ракушке»', en: 'Open-air concert at the Rakushka', zh: '“贝壳”舞台露天音乐会' }, free: true, demo: true },
  { id: 'e7', placeId: 'chkalov', start: '18:00', durationMin: 60, kind: 'walk', title: { ru: 'Закатная прогулка по Чкаловской лестнице', en: 'Sunset walk on the Chkalov Stairs', zh: '契卡洛夫台阶日落漫步' }, free: true, demo: true },
  { id: 'e8', placeId: 'fair', start: '19:00', durationMin: 120, kind: 'music', title: { ru: 'Вечерняя программа у Ярмарки', en: 'Evening programme at the Fair', zh: '集市晚间活动' }, demo: true },
  { id: 'e9', placeId: 'lower-volga', start: '20:00', durationMin: 90, kind: 'walk', title: { ru: 'Вечерняя прогулка по Нижне-Волжской набережной', en: 'Evening walk on the Lower Volga Embankment', zh: '下伏尔加河滨河路夜游' }, free: true, demo: true },
  { id: 'e10', placeId: 'wheel', start: '21:00', durationMin: 60, kind: 'family', title: { ru: 'Вечерний сеанс на колесе обозрения', en: 'Evening ride on the Ferris wheel', zh: '摩天轮夜间场' }, demo: true },
  { id: 'e11', placeId: 'minin', start: '09:00', durationMin: 60, kind: 'walk', title: { ru: 'Утренняя встреча гидов у площади Минина', en: 'Morning guides’ meet-up at Minin Square', zh: '米宁广场晨间导游集合' }, free: true, demo: true },
  { id: 'e12', placeId: 'victory', start: '16:00', durationMin: 120, kind: 'family', title: { ru: 'Детская площадка в Парке Победы', en: 'Kids’ activities in Victory Park', zh: '胜利公园儿童活动' }, free: true, demo: true },
];
