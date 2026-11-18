import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlace, parseVisit, checkPhoto } from './validate.ts';

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

test('parseVisit', () => {
  assert.deepEqual(parseVisit({ stars: '4', comment: ' good ', visited_on: '2026-01-02' }), {
    value: { stars: 4, comment: 'good', visited_on: '2026-01-02' },
  });
  assert.deepEqual(parseVisit({}), { value: { stars: null, comment: null, visited_on: null } });
  assert.deepEqual(parseVisit({ stars: '6' }), { error: 'la note doit être comprise entre 1 et 5' });
  assert.deepEqual(parseVisit({ stars: '2.5' }), { error: 'la note doit être comprise entre 1 et 5' });
  assert.deepEqual(parseVisit({ visited_on: '2026-13-40' }), { error: 'la date de visite est invalide' });
});

test('checkPhoto', () => {
  assert.equal(checkPhoto('image/jpeg', 1000), null);
  assert.ok(checkPhoto('image/svg+xml', 1000));
  assert.ok(checkPhoto('image/png', 11 * 1024 * 1024));
});
