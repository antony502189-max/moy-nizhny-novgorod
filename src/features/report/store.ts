import { readLocal } from '../../core/store.ts';
import { districtOf } from '../../core/geo.ts';

export interface Report {
  id: string; ts: number; cat: string; text: string; lat: number; lon: number; lang: 'ru' | 'en' | 'zh';
  photo?: string; district: string; synthetic?: boolean;
}
export const REPORTS_KEY = 'ng.reports';
export function loadReports(): Report[] {
  const saved = readLocal<unknown>(REPORTS_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter((r): r is Report => r && typeof r.id === 'string' && typeof r.text === 'string'
    && typeof r.cat === 'string' && ['ru','en','zh'].includes(r.lang) && Number.isFinite(r.ts)
    && Number.isFinite(r.lat) && Number.isFinite(r.lon))
    .map(r => ({...r, district: districtOf(r)}));
}

export function addReport(r: Omit<Report, 'id' | 'ts' | 'district'>): Report {
  const full = { ...r, id: 'NG-' + crypto.randomUUID(), ts: Date.now(), district: districtOf(r) };
  localStorage.setItem(REPORTS_KEY, JSON.stringify([full, ...loadReports()]));
  return full;
}

/** Downscale a user photo to <= 800px JPEG data URL (kept only in localStorage). */
export function shrinkPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}
