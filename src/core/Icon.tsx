/** One icon set (24px, 1.75 stroke, rounded). Also used as raw SVG markup inside map pins. */
export const ICONS: Record<string, string> = {
  sunset: '<path d="M12 3v3M5.6 7.6l1.6 1.6M18.4 7.6l-1.6 1.6M2 15h2M20 15h2M7 15a5 5 0 0110 0M3 19h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  drop: '<path d="M12 3s6 6.4 6 10.5a6 6 0 01-12 0C6 9.4 12 3 12 3z"/>',
  wc: '<circle cx="8" cy="5" r="1.8"/><path d="M8 8v6M5 9.5h6M6.5 14v6M9.5 14v6"/><circle cx="17" cy="5" r="1.8"/><path d="M17 8l-3 7h6zM15.5 15v5M18.5 15v5"/>',
  stairs: '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
  access: '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 8v6h5l2 5M12 11h5M9 12.5a5 5 0 105.5 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  share: '<path d="M12 15V3M8 7l4-4 4 4M5 12v8h14v-8"/>',
  volume: '<path d="M4 9.5v5h4l5 4v-13l-5 4zM16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11"/>',
  send: '<path d="M4 12l16-8-6 16-3-6.5z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7L11.5 6.8M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1.5-1.5"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M11 21l2-6-2-2 1-5 3 3 3 .5M9 10l-3 3"/>',
  cloud: '<path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.5 1.5A3.3 3.3 0 0117 18z"/>',
};

export function svgInner(name: string, size = 18): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ''}</svg>`;
}

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />
  );
}
