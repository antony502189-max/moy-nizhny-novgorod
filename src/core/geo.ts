export interface LatLon { lat: number; lon: number }
export const CENTER: LatLon = { lat: 56.3269, lon: 44.0059 };

export function distanceM(a: LatLon, b: LatLon): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function fmtDist(m: number, lang: string): string {
  if (m < 950) return `${Math.round(m / 10) * 10} ${lang === 'en' ? 'm' : lang === 'zh' ? '米' : 'м'}`;
  return `${(m / 1000).toFixed(1)} ${lang === 'en' ? 'km' : lang === 'zh' ? '公里' : 'км'}`;
}

/** Approximate city districts (nearest conventional centre — for the demo dashboard only, NOT official boundaries). */
export const DISTRICTS: { id: string; ru: string; en: string; zh: string; lat: number; lon: number }[] = [
  { id: 'nizhegorodsky', ru: 'Нижегородский', en: 'Nizhegorodsky', zh: '下城区', lat: 56.3155, lon: 43.9950 },
  { id: 'sovetsky', ru: 'Советский', en: 'Sovetsky', zh: '苏维埃区', lat: 56.2900, lon: 43.9750 },
  { id: 'kanavinsky', ru: 'Канавинский', en: 'Kanavinsky', zh: '卡纳温区', lat: 56.3330, lon: 43.9450 },
  { id: 'moskovsky', ru: 'Московский', en: 'Moskovsky', zh: '莫斯科区', lat: 56.3150, lon: 43.8950 },
  { id: 'avtozavodsky', ru: 'Автозаводский', en: 'Avtozavodsky', zh: '汽车厂区', lat: 56.2450, lon: 43.8750 },
  { id: 'sormovsky', ru: 'Сормовский', en: 'Sormovsky', zh: '索尔莫沃区', lat: 56.3600, lon: 43.8650 },
  { id: 'prioksky', ru: 'Приокский', en: 'Prioksky', zh: '奥卡河畔区', lat: 56.2700, lon: 43.9300 },
  { id: 'leninsky', ru: 'Ленинский', en: 'Leninsky', zh: '列宁区', lat: 56.2750, lon: 43.9950 },
];

export function districtOf(p: LatLon): string {
  let best = DISTRICTS[0], bd = Infinity;
  for (const d of DISTRICTS) { const x = distanceM(p, d); if (x < bd) { bd = x; best = d; } }
  return best.id;
}
