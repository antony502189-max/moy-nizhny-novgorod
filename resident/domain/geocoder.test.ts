import test from 'node:test';
import assert from 'node:assert/strict';
import { matchAddresses } from '../platform/geocoding.ts';

test('offline search preserves an exact house number and omits rows without coordinates', () => {
  const records = [
    {id:'a',address:'ул. Акимова, д. 41',lat:56.33,lon:44},
    {id:'b',address:'ул. Акимова, д. 411',lat:56.33,lon:44},
    {id:'c',address:'ул. Акимова, д. 41 к. 2'},
  ];
  assert.deepEqual(matchAddresses('Нижний Новгород, Акимова 41', records).map(p=>p.label),[records[0].address]);
  assert.deepEqual(matchAddresses('аб', records),[]);
});
