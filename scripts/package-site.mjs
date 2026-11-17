import { cp, mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const generated = ['index.html', 'resident.html', 'sw.js', 'bundle'];
if (process.argv.includes('--pages')) {
  const current = new Set(await readdir('dist/bundle'));
  for (const name of await readdir('bundle').catch(()=>[])) {
    if (!current.has(name) && /-[\w-]{8}\.(js|css|ttf|woff2)$/.test(name)) await unlink('bundle/'+name);
  }
  for (const name of generated) await cp('dist/' + name, name, {recursive: true});
} else {
  await rename('dist/guest.html', 'dist/index.html');
  await rename('dist/city.html', 'dist/resident.html');
  await mkdir('dist/assets', { recursive: true });
  const images = (await readdir('assets')).filter(n => n.startsWith('map-') && n.endsWith('.webp')).map(n => 'assets/' + n);
  for (const name of [...images, 'places', 'history', 'housing', 'maps', 'guide', 'fonts/OFL.txt', 'favicon.svg',
    'icon-192.png', 'icon-512.png', 'manifest.webmanifest', '.nojekyll']) {
    await cp(name, 'dist/' + name, { recursive: true, filter: path => !path.endsWith('.md') });
  }
  const files = (await readdir('dist', { recursive: true, withFileTypes: true }))
    .filter(e => e.isFile() && !e.name.startsWith('.'))
    .map(e => (e.parentPath + '/' + e.name).split('dist/').pop()).sort();
  const hash = createHash('sha256');
  for (const f of files) hash.update(f).update(await readFile('dist/' + f));
  const template = await readFile('scripts/worker.js','utf8');
  hash.update(template);
  const worker = template
    .replace('__VERSION__', hash.digest('hex').slice(0,16)).replace('/* MANIFEST */ []', JSON.stringify(files));
  await writeFile('dist/sw.js', worker);
}
