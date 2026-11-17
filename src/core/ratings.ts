import { readLocal } from './store';

export const ratingsKey = 'ng.placeRatings';
export function readRatings(): Record<string, number> {
  const saved = readLocal<unknown>(ratingsKey, {});
  return Object.fromEntries(Object.entries(saved && typeof saved === 'object' ? saved : {})
    .filter(([, value]) => Number.isInteger(value) && value >= 1 && value <= 5));
}
