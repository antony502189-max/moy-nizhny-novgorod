import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './App';

// Bookmarks and shared walks made before guest mode still open the resident catalogue.
function openResidentBookmark() {
  if (!/^#\/?(home|house|services|culture|favorites|roads|walk|routes)(?:[/?]|$)/.test(location.hash)) return false;
  location.replace('./resident.html' + location.search + location.hash);
  return true;
}
window.addEventListener('hashchange', openResidentBookmark);
if (!openResidentBookmark()) createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {}));
}
