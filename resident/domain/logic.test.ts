import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, parsePreferences, toggleFavorite, plural } from './logic.ts';
import { places, walks, categories, closures } from './data.ts';

test('all recorded route points resolve to unique catalog objects in the recorded order',()=>{
 assert.equal(new Set(places.map(p=>p.id)).size,places.length);
 for(const walk of walks){if(walk.placeIds){assert.equal(walk.count,walk.placeIds.length);for(const id of walk.placeIds)assert.ok(places.find(p=>p.id===id),id)}}
 assert.deepEqual(walks.find(w=>w.id==='embankments')!.placeIds,['cable','wheel','shell','deer','mayak','markin']);
 assert.equal(categories.length,10);
 assert.equal(new Set(closures.map(c=>c.id)).size,closures.length);
});
test('category selection excludes other types and clear restores complete catalog',()=>{
 const filtered=filterPlaces(places,'Набережные');
 assert.ok(filtered.length>=6);
 assert.ok(filtered.every(p=>p.category==='Набережные'));
 assert.ok(!filtered.some(p=>p.id==='wheel'));
 assert.equal(filterPlaces(places,''),places);
 assert.deepEqual(filterPlaces(places,'Города-побратимы'),[]);
});
test('favorites remain independent across object and route catalogs without mutating previous state',()=>{
 const initial={places:['chkalov'],walks:['embankments']};
 const next=toggleFavorite(initial,'places','wheel');
 assert.deepEqual(next.places,['chkalov','wheel']);
 assert.deepEqual(initial.places,['chkalov']);
 assert.deepEqual(toggleFavorite(next,'places','chkalov'),{places:['wheel'],walks:['embankments']});
 assert.deepEqual(toggleFavorite(next,'walks','embankments').places,['chkalov','wheel']);
});
test('corrupt or partially edited storage cannot break app startup',()=>{
 for(const value of [null,'invalid','null','[]','true'])assert.equal(parsePreferences(value).onboarded,false);
 const prefs=parsePreferences('{"onboarded":"yes","homeQuery":12,"favorites":{"places":["chkalov",null,1,"chkalov"],"walks":false}}');
 assert.deepEqual(prefs.favorites,{places:['chkalov'],walks:[]});
 assert.equal(prefs.homeQuery,'');
 const valid={onboarded:true,homeQuery:'пр-кт Бусыгина',favorites:{places:['wheel'],walks:['embankments']}};
 const restored=parsePreferences(JSON.stringify(valid));assert.equal(restored.homeQuery,valid.homeQuery);assert.deepEqual(restored.favorites,valid.favorites);
});
test('Russian counts are correct for teens and compound numbers',()=>{
 assert.equal(plural(1,'минута','минуты','минут'),'минута');
 assert.equal(plural(62,'минута','минуты','минут'),'минуты');
 assert.equal(plural(11,'минута','минуты','минут'),'минут');
 assert.equal(plural(114,'минута','минуты','минут'),'минут');
});
