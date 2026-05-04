import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth.js';
import { hashData } from '../services/apify-services.js';

test('hashPassword returns salt:hash format', () => {
  const h = hashPassword('mypassword');
  assert.ok(h.includes(':'), 'should include colon separator');
  const parts = h.split(':');
  assert.equal(parts.length, 2);
  assert.equal(parts[0].length, 32, 'salt should be 32 hex chars (16 bytes)');
  assert.equal(parts[1].length, 64, 'hash should be 64 hex chars (32 bytes)');
});

test('hashPassword produces different hashes for same password (unique salt)', () => {
  const h1 = hashPassword('samepassword');
  const h2 = hashPassword('samepassword');
  assert.notEqual(h1, h2, 'each hash must use a unique salt');
});

test('verifyPassword accepts correct password', () => {
  const h = hashPassword('correct');
  assert.ok(verifyPassword('correct', h));
});

test('verifyPassword rejects wrong password', () => {
  const h = hashPassword('correct');
  assert.ok(!verifyPassword('wrong', h));
});

test('verifyPassword returns false for null/undefined stored', () => {
  assert.ok(!verifyPassword('anything', null));
  assert.ok(!verifyPassword('anything', undefined));
});

test('verifyPassword handles legacy SHA-256 short hash migration', () => {
  const legacyHash = hashData('legacypw');
  assert.ok(!legacyHash.includes(':'), 'legacy hash has no colon');
  assert.ok(verifyPassword('legacypw', legacyHash), 'should verify legacy hash');
  assert.ok(!verifyPassword('wrong', legacyHash), 'wrong password must fail on legacy hash');
});

test('verifyPassword returns false for malformed stored hash', () => {
  assert.ok(!verifyPassword('anything', ':'));
  assert.ok(!verifyPassword('anything', 'notahash'));
  assert.ok(!verifyPassword('anything', 'a:b'));  // hash too short
});
