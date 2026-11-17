import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, validPoint, validHome, routeUrl, parseBackup } from './geo.ts';
import { parsePreferences } from './logic.ts';
import { places,walks } from './data.ts';
test('coordinates reject corrupt backups and non-finite values',()=>{
 for(const p of [null,{}, {lat:Infinity,lon:0},{lat:91,lon:44},{lat:'56',lon:44}])assert.equal(validPoint(p),false);
 assert.equal(validHome({lat:56.3,lon:44,label:'Мой дом'}),true);
 assert.equal(parsePreferences(JSON.stringify({home:{lat:NaN,lon:44,label:'Дом'}})).home,undefined);
});
test('distance and route preserve the waypoint order with latitude first',()=>{
 assert.equal(distanceKm({lat:56,lon:44},{lat:56,lon:44}),0);
 assert.ok(Math.abs(distanceKm({lat:0,lon:0},{lat:0,lon:1})-111.195)<0.01);
 for(const walk of walks){const points=walk.placeIds!.map(id=>places.find(p=>p.id===id)!);assert.ok(points.every(validPoint));const url=new URL(routeUrl(points));assert.equal(url.searchParams.get('rtt'),'pd');assert.equal(url.searchParams.get('rtext'),points.map(p=>`${p.lat},${p.lon}`).join('~'));}
});
test('backup import refuses unrelated or oversized JSON without changing data',()=>{
 for(const input of ['{}','not json','x'.repeat(100001),'{"app":"moynn-web","version":2}'])assert.throws(()=>parseBackup(input));
 const preferences={homeQuery:'Дом',favorites:{places:['chkalov'],walks:[]}};
 assert.deepEqual(parseBackup(JSON.stringify({app:'moynn-web',version:1,preferences})),preferences);
});
