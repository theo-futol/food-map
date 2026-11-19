import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAuthed, isPassword, token } from './auth.ts';

test('auth', () => {
  delete process.env.APP_PASSWORD;
  assert.equal(isPassword(''), false);
  assert.equal(isAuthed(token()), false);
  process.env.APP_PASSWORD = 'secret';
  assert.equal(isPassword('secret'), true);
  assert.equal(isPassword('nope'), false);
  assert.equal(isPassword(undefined), false);
  assert.equal(isAuthed(token()), true);
  assert.equal(isAuthed('secret'), false);
  assert.equal(isAuthed(undefined), false);
});
