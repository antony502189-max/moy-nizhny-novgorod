import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {chromium} from 'playwright-core';
import {places,walks} from '../resident/domain/data.ts';
import {HISTORY,historyForPlace} from '../src/data/history.ts';
import {TWINS} from '../src/data/twin.ts';
import {CENTER} from '../src/core/geo.ts';
import {sunDay} from '../src/core/sun.ts';

const root=resolve('dist');
const prefix='/city/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.m4a':'audio/mp4',
  '.webmanifest':'application/manifest+json','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,pathname.slice(prefix.length)||'index.html');
    if(!pathname.startsWith(prefix)||!file.startsWith(root+sep)){res.writeHead(404).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'}).end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+prefix;
let browser;
try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true});
  const geolocation = { latitude: 56.3280332, longitude: 44.0021054 };
  const clockContext = await browser.newContext({
    locale: 'ru-RU', timezoneId: 'America/Los_Angeles', permissions: ['geolocation'], geolocation,
  });
  try {
    const clockPage = await clockContext.newPage();
    const afternoon = new Date('2026-11-19T12:00:00+03:00');
    const today = sunDay(afternoon, CENTER.lat, CENTER.lon);
    const nextAfternoon = new Date('2026-11-20T12:00:00+03:00');
    const tomorrow = sunDay(nextAfternoon, CENTER.lat, CENTER.lon);
    await clockPage.clock.install({ time: afternoon });
    await clockPage.goto(base + '?now=01:00#/now');
    const timer = clockPage.getByRole('timer');
    const sunsetTime = clockPage.locator('.now-sunset .big time');
    await clockPage.getByRole('heading', { name: 'Закат сегодня' }).waitFor();
    await clockPage.getByText('Сейчас 12:00 МСК', { exact: false }).waitFor();
    assert.equal(await sunsetTime.getAttribute('datetime'), today.sunset.toISOString());
    const firstCountdown = await timer.innerText();
    await clockPage.clock.runFor(1000);
    await clockPage.waitForFunction(previous => document.querySelector('[role="timer"]').textContent !== previous, firstCountdown);

    await clockPage.clock.setSystemTime(new Date(today.sunset.getTime() + 1000));
    await clockPage.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await clockPage.getByRole('heading', { name: 'Закат завтра' }).waitFor();
    assert.equal(await sunsetTime.getAttribute('datetime'), tomorrow.sunset.toISOString());
    assert.match(await timer.innerText(), /до заката/);

    await clockPage.clock.setSystemTime(new Date('2026-11-19T23:59:59+03:00'));
    await clockPage.clock.runFor(1000);
    await clockPage.getByRole('heading', { name: 'Закат сегодня' }).waitFor();
    assert.equal(await sunsetTime.getAttribute('datetime'), tomorrow.sunset.toISOString());

    await clockPage.getByRole('button', { name: 'Рядом со мной' }).click();
    await clockPage.getByText(/Прогноз по вашей геопозиции/).waitFor();
    const local = sunDay(nextAfternoon, geolocation.latitude, geolocation.longitude);
    assert.equal(await sunsetTime.getAttribute('datetime'), local.sunset.toISOString());
  } finally {
    await clockContext.close();
  }
  const context=await browser.newContext({locale:'ru-RU',viewport:{width:390,height:844},
    permissions:['geolocation'],geolocation});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  context.on('request',req=>{if(req.url().startsWith('http')&&!req.url().startsWith(base))errors.push(req.url())});
  async function visit(route,selector){await page.goto(base+route);await page.locator(selector).first().waitFor()}
  await visit('#/now','main h1');
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller),null,{timeout:60000});
  await context.setOffline(true);
  await page.reload();
  const sunsetSpots = page.getByRole('group', { name: 'Где встретить закат' }).getByRole('button');
  async function checkCenteredPin(title) {
    const map = page.getByRole('region', { name: 'Карта', exact: true });
    await page.waitForFunction(({title}) => {
      const map = document.querySelector('.leafmap');
      const marker = [...map.querySelectorAll('.leaflet-marker-icon')].find(el => el.title === title);
      if (!marker?.querySelector('.pin--sel')) return false;
      const bounds = map.getBoundingClientRect(), pin = marker.getBoundingClientRect();
      return bounds.top >= 0 && bounds.top < innerHeight / 2
        && Math.abs(pin.x + pin.width / 2 - (bounds.x + bounds.width / 2)) < 3
        && Math.abs(pin.y + pin.height / 2 - (bounds.y + bounds.height / 2)) < 3;
    }, { title });
    assert(await map.isVisible());
  }
  await sunsetSpots.first().waitFor();
  assert.equal(await page.locator('.now-distance').count(), 0);
  await page.getByRole('button', { name: 'Закат', exact: true }).click();
  for (const spot of await sunsetSpots.all()) {
    const title = await spot.locator('b').innerText();
    await spot.click();
    await checkCenteredPin(title);
  }
  const mapSection = page.locator('main section').filter({ has: page.getByRole('heading', { name: 'Карта мест и удобств' }) });
  const nearMe = mapSection.getByRole('button', { name: 'Рядом со мной' });
  await nearMe.click();
  await checkCenteredPin('Вы здесь');
  assert.equal(await page.locator('.now-distance').count(), await sunsetSpots.count());
  assert.match(await page.locator('.now-distance').first().innerText(), /^≈ /);
  assert.equal(await page.getByRole('heading', { name: /^(Ближайшее|Удобства рядом)$/ }).count(), 0);
  assert.equal(await page.locator('.stats button').count(), 0);
  assert(await mapSection.getByRole('button', { name: 'Туалеты', exact: true }).isVisible());
  assert(await mapSection.getByRole('button', { name: 'Питьевая вода', exact: true }).isVisible());

  await context.setGeolocation({ latitude: 56.3280332, longitude: 44.0021054, accuracy: 1000 });
  await nearMe.click();
  await page.getByText(/Геопозиция слишком неточная/).waitFor();
  assert.equal(await page.locator('.now-distance, .pin--me').count(), 0);
  await context.setGeolocation({ latitude: 55.75, longitude: 37.61 });
  await nearMe.click();
  await page.getByText(/за пределами карты Нижнего Новгорода/).waitFor();
  assert.equal(await page.locator('.now-distance, .pin--me').count(), 0);
  await context.setGeolocation({ latitude: 56.3280332, longitude: 44.0021054 });
  const deniedContext = await browser.newContext({ locale: 'ru-RU' });
  try {
    const deniedPage = await deniedContext.newPage();
    const cdp = await deniedContext.newCDPSession(deniedPage);
    const { targetInfo } = await cdp.send('Target.getTargetInfo');
    await cdp.send('Browser.setPermission', {
      permission: { name: 'geolocation' }, origin: new URL(base).origin,
      browserContextId: targetInfo.browserContextId, setting: 'denied',
    });
    await deniedPage.goto(base + '#/now');
    await deniedPage.getByRole('button', { name: 'Рядом со мной' }).click();
    await deniedPage.getByText(/Доступ к геопозиции закрыт/).waitFor();
    assert.equal(await deniedPage.locator('.now-distance, .pin--me').count(), 0);
  } finally {
    await deniedContext.close();
  }

  await visit('#/twin', '#twin-search');
  const cityLinks = page.locator('main a[href^="#/twin/"]');
  const citySearch = page.locator('#twin-search');
  assert.equal(await cityLinks.count(), TWINS.length);
  await citySearch.fill('Сербия');
  assert.equal(await cityLinks.count(), 1);
  assert.equal(await cityLinks.first().getAttribute('href'), '#/twin/novi-sad');
  await citySearch.fill('Германия');
  assert.equal(await cityLinks.count(), 0);
  await page.getByText('Ничего не найдено.', {exact: true}).waitFor();
  await citySearch.fill('Wuxi');
  assert.equal(await cityLinks.count(), 1);
  await cityLinks.first().click();
  await page.getByRole('heading', { name: 'Уси', exact: true }).waitFor();
  assert.match(await page.getByRole('link', {name: /Источник о статусе/}).getAttribute('href'), /^https:\/\/en\.wuxi\.gov\.cn\//);
  for (const city of TWINS) {
    await visit('#/twin/' + city.id, 'main h1');
    assert.equal(await page.locator('main h1').innerText(), city.name.ru);
    assert.equal(await page.getByRole('link', {name: /Источник о статусе/}).getAttribute('href'), city.source);
    if (city.relatedAgreement) {
      await page.getByText(city.relatedAgreement.text.ru, {exact: false}).waitFor();
      assert.equal(await page.getByRole('link', {name: /Источник о соглашении/}).getAttribute('href'), city.relatedAgreement.source);
    }
  }
  await visit('#/guide','main h2');
  assert.equal(await page.locator('.leaflet-marker-icon').count(),places.length);
  for(const place of places){
    await visit('#/guide/'+place.id,'.narration[open] .chips');
    assert.equal(await page.locator('.leaflet-marker-icon').count(),1,place.id);
    assert((await page.locator('.narration p').innerText()).length>30,place.id);
  }
  for(const walk of walks){
    for(const [route,selector] of [['resident.html#/walk/','.walk-detail'],['#/guide/walk/','.walk-control']]){
      await visit(route+walk.id,selector);
      assert.equal(await page.locator('.leaflet-marker-icon').count(),walk.placeIds.length);
      assert.equal(await page.locator('.leaflet-overlay-pane path').count(),walk.placeIds.length-1);
    }
  }
  for (const place of places) {
    await visit('#/history/landmark/' + place.id, '.history-timeline');
    assert.equal(await page.locator('main h1').innerText(), historyForPlace(place.id).title.ru, place.id);
  }
  await visit('#/guide', '.leafmap');
  await page.locator('input[type=search]').fill('Дмитриевская башня');
  await page.locator('.leaflet-marker-icon[title="Дмитриевская башня"]').click();
  await page.locator('.history-timeline').waitFor();
  assert.equal(await page.locator('main h1').innerText(), 'Дмитриевская башня');
  await page.getByRole('link', {name:'Где это'}).click();
  await page.locator('.history-atlas__map .pin--sel').waitFor();
  assert.equal(await page.locator('.history-atlas__selected').innerText(), 'Дмитриевская башня');
  await visit('#/history', '.history-atlas__map');
  assert.equal(await page.locator('.history-atlas .row').count(), HISTORY.length);
  const search = page.getByRole('searchbox', {name:'Найти место на карте'});
  await search.fill('несуществующий объект');
  assert.equal(await page.locator('.history-atlas .row, .history-atlas .leaflet-marker-icon').count(), 0);
  await search.fill('Губернская гимназия');
  await page.locator('.leaflet-marker-icon[title="Губернская гимназия"]').click();
  await page.locator('.history-timeline').waitFor();
  assert.equal(await page.locator('main h1').innerText(), 'Губернская гимназия');
  for(const spot of HISTORY){
    await visit('#/history/map/'+spot.id, '.history-atlas__map .pin--sel');
    await page.locator('.history-atlas__map .pin--sel').click();
    await page.locator('.history-timeline').waitFor();
    assert.equal(await page.locator('main h1').innerText(), spot.title.ru);
    const stages = page.getByRole('radiogroup', {name:'Фотохронология'}).getByRole('radio');
    const photo = page.locator('.history-timeline__photo img');
    const frames = [...spot.then, spot.now];
    assert.equal(await stages.count(), 4);
    for (const [i, frame] of frames.entries()) {
      await page.locator('.history-timeline__choice').nth(i).click();
      assert(await stages.nth(i).isChecked(), spot.id);
      assert.equal(await photo.getAttribute('src'), frame.src);
      await photo.evaluate(img => img.decode());
      assert.equal(await page.locator('figcaption p').innerText(), frame.caption.ru);
    }
    await stages.last().focus();
    await page.keyboard.press('ArrowLeft');
    assert(await stages.nth(2).isChecked());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await visit('#/tour?ids=kremlin,art','.step');
  await page.getByRole('button',{name:'Начать прогулку'}).click();
  await page.getByRole('button',{name:'Подсказывать истории рядом'}).click();
  await page.getByRole('link',{name:/Вы рядом/}).waitFor();
  await page.getByRole('button',{name:'Отметить посещение'}).click();
  await page.getByRole('button',{name:'Отметить посещение'}).click();
  await page.getByLabel('Прикрепить фото').setInputFiles(resolve(root,'history/stadium-2016.jpg'));
  await page.locator('.walk-photos img').waitFor();await page.reload();await page.locator('.walk-photos img').waitFor();
  const range=await page.evaluate(async()=>{const r=await fetch('./guide/audio/kremlin.m4a',{headers:{range:'bytes=0-127'}});return [r.status,(await r.arrayBuffer()).byteLength]});
  assert.deepEqual(range,[206,128]);

  for(const [width,height,scale] of [[320,568,1],[390,844,1],[768,1024,1],[1280,800,1],[320,640,2],[844,390,1]]){
    await page.setViewportSize({width,height});
    await page.evaluate(scale=>{document.documentElement.style.fontSize=16*scale+'px'},scale);
    for(const route of ['#/tour','#/guide','#/history','#/history/stadium','#/report','#/more','#/twin','#/twin/east-sarajevo']){
      await visit(route,'main h1');
      const fits=await page.evaluate(()=>{
        const main=document.querySelector('.app > main'),nav=document.querySelector('.tabbar');
        const labels=Array.from(nav.querySelectorAll('.tab__label'));
        return main.getBoundingClientRect().bottom<=nav.getBoundingClientRect().top+1
          && main.scrollWidth<=main.clientWidth+1 && document.documentElement.scrollWidth<=innerWidth+1
          && labels.every(label=>label.getBoundingClientRect().height<=parseFloat(getComputedStyle(label).lineHeight)+1)
          && labels.every((label,i)=>i===0 || labels[i-1].getBoundingClientRect().right<=label.getBoundingClientRect().left);
      });
      assert(fits,route+' at '+width+'px / '+scale+'x');
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Verified sunset and location map controls, both offline maps, all landmarks, walks, archive stages, walk photos and navigation layout.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
