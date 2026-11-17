import { searchHouses, type HouseRecord } from '../domain/housing.ts';
import { validHome } from '../domain/geo.ts';
import { places } from '../domain/data.ts';
import type { SavedHome } from '../domain/types';
import { bundledHousing, readHousing } from './housingStorage.ts';

export function matchAddresses(query: string, records: HouseRecord[]): SavedHome[] {
  const search = query.replace(/нижний новгород,?\s*/ig, '').trim();
  if (search.length < 3) return [];
  const catalogue = places.flatMap(p => validHome({lat:p.lat, lon:p.lon, label:p.title})
    ? [{id:p.id, address:p.title+' '+p.address, lat:p.lat, lon:p.lon, label:p.title+', '+p.address}] : []);
  const results: SavedHome[] = [];
  const labels = new Set<string>();
  for (const row of searchHouses([...records, ...catalogue], search)) {
    const home = { label: 'label' in row ? String(row.label) : row.address, lat: row.lat, lon: row.lon };
    if (validHome(home) && !labels.has(home.label)) {
      labels.add(home.label);
      results.push(home);
      if (results.length === 12) break;
    }
  }
  return results;
}

export async function searchAddress(query: string, signal: AbortSignal) {
  const imported = await readHousing().catch(() => undefined);
  signal.throwIfAborted();
  const data = imported || await bundledHousing();
  signal.throwIfAborted();
  return matchAddresses(query, data.records);
}
