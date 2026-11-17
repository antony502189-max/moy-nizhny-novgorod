// Fetches guest amenities for central Nizhny Novgorod from OpenStreetMap (Overpass API).
// Output: src/data/amenities.json  (ODbL — © OpenStreetMap contributors)
// Usage: npm run data:amenities
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BBOX = '56.300,43.940,56.345,44.070'; // south,west,north,east: historic centre + Kanavino + Strelka
const q = `[out:json][timeout:60];
(
  nwr["amenity"="toilets"](${BBOX});
  nwr["amenity"="drinking_water"](${BBOX});
  node["man_made"="water_tap"]["drinking_water"="yes"](${BBOX});
  way["highway"="steps"](${BBOX});
  nwr["wheelchair"="yes"]["tourism"](${BBOX});
  nwr["wheelchair"="yes"]["amenity"~"cafe|restaurant|toilets"](${BBOX});
);
out center tags 4000;`;

const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let data = null;
for (const ep of endpoints) {
  try {
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'nizhny-for-guests-hackathon/0.1', accept: 'application/json' },
      body: 'data=' + encodeURIComponent(q),
    });
    if (!r.ok) throw new Error(ep + ' -> HTTP ' + r.status);
    data = await r.json();
    break;
  } catch (e) { console.error('overpass failed:', e.message); }
}
if (!data) { console.error('No Overpass data; keeping existing src/data/amenities.json'); process.exit(1); }

const items = [];
for (const el of data.elements) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
  if (lat == null) continue;
  let kind = null;
  if (t.amenity === 'toilets') kind = 'toilet';
  else if (t.amenity === 'drinking_water' || t.man_made === 'water_tap') kind = 'water';
  else if (t.highway === 'steps') kind = 'steps';
  else if (t.wheelchair === 'yes') kind = 'stepfree';
  if (!kind) continue;
  items.push({
    id: `${el.type[0]}${el.id}`, kind, lat: +lat.toFixed(6), lon: +lon.toFixed(6),
    name: t.name || undefined, fee: t.fee || undefined, wheelchair: t.wheelchair || undefined,
    opening: t.opening_hours || undefined,
  });
}
const out = {
  source: 'OpenStreetMap contributors via Overpass API', license: 'ODbL 1.0', licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
  fetchedAt: new Date().toISOString().slice(0, 10), bbox: BBOX, count: items.length, items,
};
const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, '../src/data/amenities.json'), JSON.stringify(out));
const counts = items.reduce((a, i) => ((a[i.kind] = (a[i.kind] || 0) + 1), a), {});
console.log('saved', items.length, counts);
