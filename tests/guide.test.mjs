import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {places,walks} from '../resident/domain/data.ts';
import {HISTORY} from '../src/data/history.ts';
import {curatedLegs} from '../src/core/curatedPaths.ts';
import {parseIntent,planOffline} from '../src/features/tour/planner.ts';
import {PLACES} from '../src/data/places.ts';

test('every landmark and archive stage has sourced trilingual narration and local Russian audio',()=>{
  const stories=JSON.parse(readFileSync(new URL('../guide/stories.json',import.meta.url),'utf8'));
  const ids=[...places.map(p=>p.id),...HISTORY.flatMap(h=>h.then.map(p=>'photo-'+p.id))];
  assert.deepEqual(Object.keys(stories).sort(),ids.sort());
  for(const id of ids){
    const story=stories[id];assert.equal(new URL(story.source).protocol,'https:');
    for(const lang of ['ru','en','zh'])assert(story.text[lang].trim().length>30,id+' '+lang);
    const clip=readFileSync(new URL('../guide/audio/'+id+'.m4a',import.meta.url));
    assert.equal(clip.toString('ascii',4,8),'ftyp');assert(clip.length>5000);
  }
  for(const h of HISTORY)for(const image of [h.now,...h.then]){
    assert(readFileSync(new URL('../'+image.src,import.meta.url)).length>1000);
    assert(image.credit.author && image.credit.license && image.credit.sourceUrl);
  }
});
test('every consecutive leg of every published walk follows the bundled street graph',()=>{
  for(const w of walks){
    const legs=curatedLegs(w.placeIds);assert.equal(legs.length,w.placeIds.length-1);
    for(const leg of legs)assert(leg.meters>0 && leg.points.length>=2,w.id+' '+leg.id);
  }
});
test('dictated durations and visitor interests reach the offline planner',()=>{
  for(const s of ['прогулка на три часа','three hours','三个小时'])assert.equal(parseIntent(s).minutes,180,s);
  for(const [interest,tag] of [['кафе','food'],['сувениры','souvenir']]){
    const tour=planOffline(interest+' 30 мин','ru',s=>s.ru);
    assert(tour.stops.some(s=>PLACES.find(p=>p.id===s.id).tags.includes(tag)));
  }
});
