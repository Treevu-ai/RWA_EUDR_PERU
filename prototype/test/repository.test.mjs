import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { JsonRepo } from '../lib/repository.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rwa-repo-'));
const repoFile = path.join(tmp, 'items.json');

function freshRepo(defaultValue = []) {
  if (fs.existsSync(repoFile)) fs.unlinkSync(repoFile);
  return JsonRepo.fromFile(repoFile, defaultValue);
}

test('JsonRepo.fromFile initialises from default value when file is missing', () => {
  const repo = freshRepo([{ id: 'a1', name: 'Alpha' }]);
  assert.equal(repo.length, 1);
  assert.deepEqual(repo.all()[0], { id: 'a1', name: 'Alpha' });
});

test('JsonRepo.fromFile loads existing file', () => {
  fs.writeFileSync(repoFile, JSON.stringify([{ id: 'x1' }]));
  const repo = JsonRepo.fromFile(repoFile, []);
  assert.equal(repo.length, 1);
  assert.equal(repo.findById('x1').id, 'x1');
});

test('push adds item and persists to disk', () => {
  const repo = freshRepo();
  const item = { id: 'b1', val: 42 };
  repo.push(item);
  assert.equal(repo.length, 1);
  const persisted = JSON.parse(fs.readFileSync(repoFile, 'utf8'));
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].id, 'b1');
});

test('findById returns the correct item', () => {
  const repo = freshRepo([{ id: 'c1' }, { id: 'c2' }]);
  assert.equal(repo.findById('c2').id, 'c2');
  assert.equal(repo.findById('nonexistent'), undefined);
});

test('findIndex returns correct position and -1 when missing', () => {
  const repo = freshRepo([{ id: 'd1' }, { id: 'd2' }]);
  assert.equal(repo.findIndex('d2'), 1);
  assert.equal(repo.findIndex('nope'), -1);
});

test('updateAt applies patch and adds updatedAt', () => {
  const repo = freshRepo([{ id: 'e1', name: 'old' }]);
  const updated = repo.updateAt(0, { name: 'new' });
  assert.equal(updated.name, 'new');
  assert.equal(updated.id, 'e1', 'id must not be removed');
  assert.ok(updated.updatedAt, 'updatedAt should be set');
  // Verify persisted
  const disk = JSON.parse(fs.readFileSync(repoFile, 'utf8'));
  assert.equal(disk[0].name, 'new');
});

test('removeAt deletes item and persists', () => {
  const repo = freshRepo([{ id: 'f1' }, { id: 'f2' }]);
  const deleted = repo.removeAt(0);
  assert.equal(deleted.id, 'f1');
  assert.equal(repo.length, 1);
  assert.equal(repo.findById('f1'), undefined);
  const disk = JSON.parse(fs.readFileSync(repoFile, 'utf8'));
  assert.equal(disk.length, 1);
});

test('replace swaps entire contents and persists', () => {
  const repo = freshRepo([{ id: 'g1' }]);
  repo.replace([{ id: 'h1' }, { id: 'h2' }]);
  assert.equal(repo.length, 2);
  assert.equal(repo.findById('h1').id, 'h1');
  const disk = JSON.parse(fs.readFileSync(repoFile, 'utf8'));
  assert.equal(disk.length, 2);
});

test('trim removes oldest entries keeping only the last maxLen', () => {
  const items = [1, 2, 3, 4, 5].map((n) => ({ id: `t${n}` }));
  const repo = freshRepo(items);
  repo.trim(3);
  assert.equal(repo.length, 3);
  assert.equal(repo.all()[0].id, 't3', 'oldest entries should be dropped');
  assert.equal(repo.all()[2].id, 't5');
});

test('trim does nothing when length <= maxLen', () => {
  const repo = freshRepo([{ id: 'u1' }, { id: 'u2' }]);
  repo.trim(5);
  assert.equal(repo.length, 2);
});

test('all() returns a copy — mutations do not affect repo', () => {
  const repo = freshRepo([{ id: 'v1' }]);
  const copy = repo.all();
  copy.push({ id: 'intruder' });
  assert.equal(repo.length, 1, 'internal array must not be affected');
});

test('filter returns matching items without mutating repo', () => {
  const repo = freshRepo([{ id: 'w1', active: true }, { id: 'w2', active: false }]);
  const active = repo.filter((x) => x.active);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, 'w1');
  assert.equal(repo.length, 2, 'repo must not be mutated by filter');
});
