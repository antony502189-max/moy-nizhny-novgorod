import polygons from '../data/districts.json' with { type: 'json' };
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

/** Localized names keyed by the OSM administrative boundary. */
export const DISTRICTS: { id: string; ru: string; en: string; zh: string; }[] = [
  { id: 'nizhegorodsky', ru: 'Нижегородский', en: 'Nizhegorodsky', zh: '下城区' },
  { id: 'sovetsky', ru: 'Советский', en: 'Sovetsky', zh: '苏维埃区' },
  { id: 'kanavinsky', ru: 'Канавинский', en: 'Kanavinsky', zh: '卡纳温区' },
  { id: 'moskovsky', ru: 'Московский', en: 'Moskovsky', zh: '莫斯科区' },
  { id: 'avtozavodsky', ru: 'Автозаводский', en: 'Avtozavodsky', zh: '汽车厂区' },
  { id: 'sormovsky', ru: 'Сормовский', en: 'Sormovsky', zh: '索尔莫沃区' },
  { id: 'prioksky', ru: 'Приокский', en: 'Prioksky', zh: '奥卡河畔区' },
  { id: 'leninsky', ru: 'Ленинский', en: 'Leninsky', zh: '列宁区' },
];

function contains(ring: number[][], p: LatLon) {
  let inside = false;
  for (let i=0, j=ring.length-1; i<ring.length; j=i++) {
    const [y1,x1] = ring[j], [y2,x2] = ring[i];
    if ((y1 > p.lat) !== (y2 > p.lat) && p.lon < (x2-x1)*(p.lat-y1)/(y2-y1)+x1) inside = !inside;
  }
  return inside;
}

export function districtOf(p: LatLon): string {
  for (const district of DISTRICTS) {
    const shape = polygons[district.ru as keyof typeof polygons];
    if (shape.outer.some(ring => contains(ring,p)) && !shape.inner.some(ring => contains(ring,p))) return district.id;
  }
  return 'unknown';
}
