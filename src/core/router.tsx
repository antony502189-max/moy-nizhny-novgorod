import { useEffect, useState } from 'react';

/** Hash router: works on GitHub Pages / Vercel / file hosting without rewrites. Path like "/now" or "/twin/minsk". */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '').split('?')[0];
  return h || '/now';
}
export function usePath(): string {
  const [p, setP] = useState(currentPath());
  useEffect(() => {
    const on = () => { setP(currentPath()); document.querySelector('.app > main')?.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return p;
}
export function go(path: string) { window.location.hash = path; }
