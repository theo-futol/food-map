import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlace, parseVisit, checkPhoto } from './validate.ts';

const ok = { name: 'Tangor', category: 'restaurant', city: 'Saint-Leu', lat: -21.17, lng: 55.29 };

test('parsePlace', () => {
  assert.deepEqual(parsePlace(ok), { value: ok });
  assert.deepEqual(parsePlace({ ...ok, address: '' }), { value: { ...ok, address: null } });
  assert.deepEqual(parsePlace({ ...ok, category: 'bar' }), { error: 'category is invalid' });
  assert.deepEqual(parsePlace({ ...ok, lat: 91 }), { error: 'lat is invalid' });
  assert.deepEqual(parsePlace({ ...ok, name: '  ' }), { error: 'name is invalid' });
  assert.deepEqual(parsePlace({ name: 'x' }), { error: 'category is required' });
  assert.deepEqual(parsePlace({ lat: 1, lng: 2 }, true), { value: { lat: 1, lng: 2 } });
  assert.deepEqual(parsePlace({}, true), { error: 'nothing to update' });
  assert.deepEqual(parsePlace(null), { error: 'body must be a JSON object' });
});

test('parseVisit', () => {
  assert.deepEqual(parseVisit({ stars: '4', comment: ' good ', visited_on: '2026-01-02' }), {
    value: { stars: 4, comment: 'good', visited_on: '2026-01-02' },
  });
  assert.deepEqual(parseVisit({}), { value: { stars: null, comment: null, visited_on: null } });
  assert.deepEqual(parseVisit({ stars: '6' }), { error: 'stars must be 1 to 5' });
  assert.deepEqual(parseVisit({ stars: '2.5' }), { error: 'stars must be 1 to 5' });
  assert.deepEqual(parseVisit({ visited_on: '2026-13-40' }), { error: 'visited_on is invalid' });
});

test('checkPhoto', () => {
  assert.equal(checkPhoto('image/jpeg', 1000), null);
  assert.ok(checkPhoto('image/svg+xml', 1000));
  assert.ok(checkPhoto('image/png', 11 * 1024 * 1024));
});
