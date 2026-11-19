const root = new URL('./', self.location.href);
const prefix = 'nizhny-offline:' + root.pathname + ':';
const version = prefix + '4c8b2335bd7079d3';
const files = new Set((["assets/map-akimova.webp","assets/map-city.webp","assets/map-district.webp","assets/map-oboznaya.webp","assets/map-street.webp","bundle/GuidePage-8H7Qcj4_.js","bundle/Narration-CDusiaM2.js","bundle/Narration-DeQhvrjM.css","bundle/PT_Serif-Web-Regular-HIZd4K6A.ttf","bundle/TourPage-DIjRYT4O.js","bundle/Walking-CJdJl86l.js","bundle/city-CPMFC8ss.css","bundle/city-DLoXqnE_.js","bundle/curatedPaths-DJ2fWWuL.js","bundle/data-uHNbiZoq.js","bundle/guest-DRf0Pshz.css","bundle/guest-XfflY_Zo.js","favicon.svg","fonts/OFL.txt","guide/audio/art.m4a","guide/audio/barracks.m4a","guide/audio/barysheva.m4a","guide/audio/bell.m4a","guide/audio/cable.m4a","guide/audio/chkalov.m4a","guide/audio/church.m4a","guide/audio/deer.m4a","guide/audio/dmitriev.m4a","guide/audio/fair.m4a","guide/audio/fedorovsky.m4a","guide/audio/garden.m4a","guide/audio/gaz-museum.m4a","guide/audio/gaz.m4a","guide/audio/gorky.m4a","guide/audio/hero.m4a","guide/audio/kazan-church.m4a","guide/audio/kazan-embankment.m4a","guide/audio/kozhevnikov.m4a","guide/audio/kremlin.m4a","guide/audio/lower-volga.m4a","guide/audio/markin.m4a","guide/audio/mayak.m4a","guide/audio/minin.m4a","guide/audio/model.m4a","guide/audio/monastery.m4a","guide/audio/mosque.m4a","guide/audio/north-tower.m4a","guide/audio/oka.m4a","guide/audio/olisov.m4a","guide/audio/peter.m4a","guide/audio/photo-d1913.m4a","guide/audio/photo-dpre.m4a","guide/audio/photo-fold.m4a","guide/audio/photo-g1900.m4a","guide/audio/photo-p1913.m4a","guide/audio/photo-pechersky-1900.m4a","guide/audio/photo-s1896.m4a","guide/audio/photo-stadium-2016.m4a","guide/audio/photo-stadium-2018.m4a","guide/audio/pokrovskaya.m4a","guide/audio/prison.m4a","guide/audio/rowing.m4a","guide/audio/rozhdestvenskaya.m4a","guide/audio/school.m4a","guide/audio/shell.m4a","guide/audio/shukhov.m4a","guide/audio/ski.m4a","guide/audio/sormovo-house.m4a","guide/audio/sormovo-museum.m4a","guide/audio/sormovo.m4a","guide/audio/stadium.m4a","guide/audio/station.m4a","guide/audio/suetinskaya.m4a","guide/audio/upper-volga.m4a","guide/audio/victory.m4a","guide/audio/viewpoint.m4a","guide/audio/volga.m4a","guide/audio/vyakhirev.m4a","guide/audio/walls.m4a","guide/audio/warehouses.m4a","guide/audio/wheel.m4a","guide/audio/zachatie.m4a","guide/stories.json","history/dmitriev-1913.jpg","history/dmitriev-pre1895.jpg","history/fair-old.jpg","history/pakgauzy-now.jpg","history/pechersky-1900.jpg","history/pechersky-2025.jpg","history/pokrovskaya-1913.jpg","history/shukhov-1896.jpg","history/stadium-2016.jpg","history/stadium-2018.jpg","history/stadium-2024.jpg","housing/houses-001.json","housing/houses-002.json","housing/houses-003.json","housing/houses-004.json","housing/houses-005.json","housing/houses-006.json","housing/houses-007.json","housing/houses-008.json","housing/houses-009.json","housing/houses-010.json","housing/houses-011.json","housing/houses-012.json","housing/houses-013.json","housing/houses-014.json","housing/houses-015.json","housing/houses-016.json","housing/houses-017.json","housing/houses-018.json","housing/houses-019.json","housing/houses-020.json","housing/houses-021.json","housing/houses-022.json","housing/houses-023.json","housing/houses-024.json","housing/houses-025.json","housing/houses-026.json","housing/houses-027.json","housing/houses-028.json","housing/houses-029.json","housing/houses-030.json","housing/houses-031.json","housing/houses-032.json","housing/houses-033.json","housing/manifest.json","icon-192.png","icon-512.png","index.html","manifest.webmanifest","maps/center.webp","maps/city.webp","places/barracks.jpg","places/barysheva.jpg","places/bell.jpg","places/chkalov.jpg","places/church.jpg","places/credits.json","places/dmitriev.jpg","places/fair.jpg","places/fedorovsky.jpg","places/garden.jpg","places/gaz.jpg","places/kazan-church.jpg","places/kozhevnikov.jpg","places/kremlin.jpg","places/lower-volga.jpg","places/markin.jpg","places/minin.jpg","places/pokrovskaya.jpg","places/prison.jpg","places/rowing.jpg","places/rozhdestvenskaya.jpg","places/school.jpg","places/sormovo-house.jpg","places/station.jpg","places/upper-volga.jpg","places/victory.jpg","places/vyakhirev.jpg","places/zachatie.jpg","resident.html"]).map(file => new URL(file, root).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(version);
    const urls = [...files];
    for (let i = 0; i < urls.length; i += 8) {
      await cache.addAll(urls.slice(i, i + 8).map(url => new Request(url, {cache:'reload'})));
    }
    // Let open tabs finish using their release before switching both HTML entries.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if ((name.startsWith(prefix) && name !== version) || name.startsWith('moynn-' + root.pathname + '-')) {
        await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.hash = '';
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return;
  if (event.request.mode === 'navigate') {
    url.search = '';
    if (url.pathname === root.pathname) url.pathname += 'index.html';
  }
  if (!files.has(url.href)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(version)).match(url.href);
    if (!cached) return fetch(event.request);
    const range = event.request.headers.get('range');
    if (!range || !url.pathname.endsWith('.m4a')) return cached;
    const bytes = await cached.arrayBuffer();
    const size = bytes.byteLength;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start = match?.[1] ? Number(match[1]) : Math.max(0,size - Number(match?.[2]));
    const end = match?.[1] && match[2] ? Math.min(size-1,Number(match[2])) : size-1;
    if (!match || (!match[1] && !match[2]) || start > end || start >= size) {
      return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
    }
    return new Response(bytes.slice(start,end+1),{status:206,headers:{
      'Content-Type':'audio/mp4','Accept-Ranges':'bytes','Content-Length':String(end-start+1),
      'Content-Range':'bytes '+start+'-'+end+'/'+size
    }});
  })());
});
