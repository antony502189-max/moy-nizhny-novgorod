import { readLocal, writeLocal } from '../../core/store';
import { districtOf } from '../../core/geo';

export interface Report {
  id: string; ts: number; cat: string; text: string; lat: number; lon: number; lang: 'ru' | 'en' | 'zh';
  photo?: string; district: string; synthetic?: boolean;
}
export const REPORTS_KEY = 'ng.reports';
export const loadReports = (): Report[] => { const v = readLocal<Report[]>(REPORTS_KEY, []); return Array.isArray(v) ? v : []; };

export function addReport(r: Omit<Report, 'id' | 'ts' | 'district'>): Report {
  const full: Report = { ...r, id: 'NG-' + Math.random().toString(36).slice(2, 8).toUpperCase(), ts: Date.now(), district: districtOf(r) };
  writeLocal(REPORTS_KEY, [full, ...loadReports()]);
  // Optional: forward to a serverless endpoint if the deployer configured one (never required for the demo).
  const ep = import.meta.env.VITE_REPORT_ENDPOINT as string | undefined;
  if (ep) fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...full, photo: undefined }) }).catch(() => {});
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
