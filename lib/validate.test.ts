import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlace, checkPhoto } from './validate.ts';

const ok = { name: 'Tangor', category: 'restaurant', city: 'Saint-Leu', lat: -21.17, lng: 55.29 };

test('parsePlace', () => {
  assert.deepEqual(parsePlace(ok), { value: ok });
  assert.deepEqual(parsePlace({ ...ok, address: '' }), { value: { ...ok, address: null } });
  assert.deepEqual(parsePlace({ ...ok, category: 'bar' }), { error: 'La catégorie est invalide' });
  assert.deepEqual(parsePlace({ ...ok, lat: 91 }), { error: 'La latitude est invalide' });
  assert.deepEqual(parsePlace({ ...ok, name: '  ' }), { error: 'Le nom est invalide' });
  assert.deepEqual(parsePlace({ name: 'x' }), { error: 'La catégorie est obligatoire' });
  assert.deepEqual(parsePlace({ lat: 1, lng: 2 }, true), { value: { lat: 1, lng: 2 } });
  assert.deepEqual(parsePlace({}, true), { error: 'rien à modifier' });
  assert.deepEqual(parsePlace(null), { error: 'le corps doit être un objet JSON' });
});

test('parsePlace stars and comment', () => {
  assert.deepEqual(parsePlace({ stars: 4, comment: ' bon ' }, true), { value: { stars: 4, comment: 'bon' } });
  assert.deepEqual(parsePlace({ stars: null, comment: '' }, true), { value: { stars: null, comment: null } });
  assert.deepEqual(parsePlace({ stars: 6 }, true), { error: 'La note est invalide' });
  assert.deepEqual(parsePlace({ stars: 2.5 }, true), { error: 'La note est invalide' });
  assert.deepEqual(parsePlace({ stars: '4' }, true), { error: 'La note est invalide' });
});

test('checkPhoto', () => {
  assert.equal(checkPhoto('image/jpeg', 1000), null);
  assert.ok(checkPhoto('image/svg+xml', 1000));
  assert.ok(checkPhoto('image/png', 3 * 1024 * 1024));
});
