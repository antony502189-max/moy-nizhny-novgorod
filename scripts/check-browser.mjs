import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {chromium} from 'playwright-core';
import {places,walks} from '../resident/domain/data.ts';
import {HISTORY} from '../src/data/history.ts';
import {TWINS} from '../src/data/twin.ts';

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
  const context=await browser.newContext({locale:'ru-RU',viewport:{width:390,height:844},
    permissions:['geolocation'],geolocation:{latitude:56.3280332,longitude:44.0021054}});
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
  const nearMe = page.getByRole('button', { name: 'Рядом со мной' });
  await nearMe.click();
  await checkCenteredPin('Вы здесь');
  assert.equal(await page.locator('.now-distance').count(), await sunsetSpots.count());
  assert.match(await page.locator('.now-distance').first().innerText(), /^≈ /);
  await page.locator('.stats button').first().click();
  await page.locator('.pin--sel.pin--wc').waitFor();

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
  assert.equal(await cityLinks.count(), TWINS.length);
  await page.locator('#twin-search').fill('Wuxi');
  assert.equal(await cityLinks.count(), 1);
  await cityLinks.first().click();
  await page.getByRole('heading', { name: 'Уси', exact: true }).waitFor();
  assert.match(await page.getByRole('link', {name: /Источник о статусе/}).getAttribute('href'), /^https:\/\/en\.wuxi\.gov\.cn\//);
  for (const city of TWINS) {
    await visit('#/twin/' + city.id, 'main h1');
    assert.equal(await page.locator('main h1').innerText(), city.name.ru);
    assert.equal(await page.getByRole('link', {name: /Источник о статусе/}).getAttribute('href'), city.source);
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
  for(const spot of HISTORY){
    await visit('#/history/'+spot.id,'.ba');
    for(let i=0;i<spot.then.length;i++){
      if(spot.then.length>1)await page.locator('.seg button').nth(i).click();
      await page.locator('.ba img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
      await page.getByRole('slider').focus();await page.keyboard.press('ArrowRight');
    }
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
    for(const route of ['#/tour','#/guide','#/history/stadium','#/report','#/more','#/twin','#/twin/east-sarajevo']){
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
