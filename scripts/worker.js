const root = new URL('./', self.location.href);
const prefix = 'nizhny-offline:' + root.pathname + ':';
const version = prefix + '__VERSION__';
const files = new Set((/* MANIFEST */ []).map(file => new URL(file, root).href));
const previousVersion = names => names.filter(name => name.startsWith(prefix) && name !== version).pop();

async function refreshPage(request, cached) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  let response;
  try {
    response = await fetch(request, {cache:'no-cache', signal:controller.signal});
  } catch {
    // A device with no connection can still use the installed release.
  } finally {
    clearTimeout(timeout);
  }
  return response?.ok ? response : cached ?? response ?? Response.error();
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(version);
    const urls = [...files];
    for (let i = 0; i < urls.length; i += 8) {
      await cache.addAll(urls.slice(i, i + 8).map(url => new Request(url, {cache:'reload'})));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const previous = previousVersion(names);
    for (const name of names) {
      if ((name.startsWith(prefix) && name !== version && name !== previous) || name.startsWith('moynn-' + root.pathname + '-')) {
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
  const navigation = event.request.mode === 'navigate';
  if (navigation) {
    url.search = '';
    if (url.pathname === root.pathname) url.pathname += 'index.html';
  }
  if (!files.has(url.href)) {
    if (!url.pathname.startsWith(root.pathname + 'bundle/')) return;
    event.respondWith((async () => {
      // An open tab may still request a lazy chunk from the previous build.
      const previous = previousVersion(await caches.keys());
      const cached = previous ? await (await caches.open(previous)).match(url.href) : undefined;
      return cached ?? fetch(event.request);
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await (await caches.open(version)).match(url.href);
    if (navigation) return refreshPage(event.request, cached);
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
