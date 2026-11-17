import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planOffline, parseIntent, tourMetrics, sanitizeLLM } from '../src/features/tour/planner.ts';
import { walkLine, walkDistance } from '../src/features/tour/paths.ts';
import { PLACES, placeById } from '../src/data/places.ts';
import { districtOf, CENTER } from '../src/core/geo.ts';
import { EVENTS, upcomingEvents } from '../src/data/events.ts';
import { addReport, loadReports } from '../src/features/report/store.ts';

test('offline routes in all three languages fit their budget and preserve sunset and effort', () => {
  for (const [lang,text] of [['ru','С коляской 1 ч 30 мин история и закат'],['en','90 min, sunset with a stroller'],['zh','轮椅 90分钟 日落']]) {
    const route = planOffline(text,lang,v=>v[lang]);
    assert.equal(parseIntent(text).minutes,90);
    assert.ok(route.stops.length >= 2);
    assert.ok(route.stops.every(s=>placeById(s.id).effort===0));
    assert.equal(route.profile,'noSteps');
    assert.ok(placeById(route.stops.at(-1).id).sunset);
    assert.ok(tourMetrics(route.stops,route.profile).total <= 90);
    assert.deepEqual(route,planOffline(text,lang,v=>v[lang]));
  }
  assert.equal(parseIntent('полчаса').minutes,30);
  assert.equal(sanitizeLLM({stops:[{id:'kremlin'},{id:'fair'}]},10,2),null);
});

test('all catalogue pairs have walking paths with finite lengths and geometry in town', () => {
  for(const profile of ['walk','noSteps']) for(const a of PLACES) for(const b of PLACES) {
    if(a===b) continue;
    const line=walkLine(a.id,b.id,profile);
    assert.ok(Number.isFinite(walkDistance(a.id,b.id,profile)),a.id+' → '+b.id);
    assert.ok(line.length && line.every(([y,x])=>y>56.29 && y<56.36 && x>43.92 && x<44.09));
  }
});
test('programme uses dated Moscow starts across midnight and expires permanently', () => {
  const start=Date.parse(EVENTS[0].start);
  assert.equal(upcomingEvents(new Date(start-3*3600000)).soon,true);
  assert.equal(upcomingEvents(new Date(start+1)).list.some(e=>e.id===EVENTS[0].id),false);
  assert.deepEqual(upcomingEvents(new Date('2030-01-01')).list,[]);
  assert.ok(EVENTS.every(e=>placeById(e.placeId) && new URL(e.source).hostname==='arsenal-museum.art'));
});
test('district boundaries classify the Kremlin and leave other cities outside', () => {
  assert.equal(districtOf(CENTER),'nizhegorodsky');
  assert.equal(districtOf({lat:55.75,lon:37.61}),'unknown');
});
test('old drafts are assigned current boundaries and quota failures do not acknowledge a save', () => {
  const record={id:'NG-old',ts:1,cat:'water',lang:'en',text:'water',...CENTER,district:'old'};
  globalThis.localStorage={getItem:()=>JSON.stringify([null,record]),setItem:()=>{throw new Error('quota')}};
  try {
    assert.equal(loadReports().length,1);assert.equal(loadReports()[0].district,'nizhegorodsky');
    assert.throws(()=>addReport(record),/quota/);
  } finally { delete globalThis.localStorage; }
});
