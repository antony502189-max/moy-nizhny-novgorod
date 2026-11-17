import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {places,walks} from './data.ts';
import {editorialWalks} from './editorialWalks.ts';
import {contactForHouse,managementContacts} from './houseContacts.ts';

test('catalog has sourced descriptions, usable local photos and in-city coordinates',()=>{
 assert.equal(places.length,54);
 for(const p of places){
  assert.ok(p.description&&p.description.length>120,p.id);
  assert.equal(new URL(p.descriptionSource!).protocol,'https:',p.id);
  assert.ok(p.lat!>56.18&&p.lat!<56.41&&p.lon!>43.7&&p.lon!<44.15,p.id);
  if(p.photo){assert.ok(existsSync(new URL('../../'+p.photo.src,import.meta.url)),p.id);assert.ok(p.photo.author);assert.match(p.photo.license,/CC|Public domain/);assert.equal(new URL(p.photo.sourceUrl).hostname,'commons.wikimedia.org');}
 }
});
test('three additional walks preserve existing IDs and consist of unique catalog stops',()=>{
 assert.equal(walks.length,6);assert.equal(new Set(walks.map(w=>w.id)).size,6);
 assert.deepEqual(walks.slice(0,3).map(w=>w.id),['history','kanavino','embankments']);
 for(const w of editorialWalks){assert.ok(w.editorial&&w.durationLabel&&w.tips);assert.equal(w.count,w.placeIds?.length);assert.equal(new Set(w.placeIds).size,w.count);for(const id of w.placeIds!)assert.ok(places.some(p=>p.id===id));assert.ok(w.sources?.length);}
});
test('house contacts require an exact GIS identity, never a lookalike host or company name',()=>{
 const contact=managementContacts.find(c=>c.id==='leninsky')!;
 const house={id:'test',address:'Нижний Новгород',management:'ООО «Наш Дом»',managementUrl:'https://dom.gosuslugi.ru/#!/organizationView/'+contact.gisId};
 assert.equal(contactForHouse(house)?.phone,'+78312622622');
 assert.equal(contactForHouse({...house,managementUrl:undefined}),undefined);
 assert.equal(contactForHouse({...house,managementUrl:house.managementUrl.replace('dom.gosuslugi.ru','dom.gosuslugi.ru.example.org')}),undefined);
 assert.equal(contactForHouse({...house,managementUrl:'https://dom.gosuslugi.ru/#!/organizationView/00000000-0000-0000-0000-000000000000'}),undefined);
});
