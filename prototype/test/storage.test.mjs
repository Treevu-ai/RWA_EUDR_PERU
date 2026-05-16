import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { loadJSON, saveJSON, loadWithSeed, ensureDataDir } from '../lib/storage.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rwa-storage-'));
const testFile = path.join(tmp, 'test.json');

test('loadJSON creates file with default value when missing', () => {
  const result = loadJSON(testFile, [{ id: 1 }]);
  assert.deepEqual(result, [{ id: 1 }]);
  assert.ok(fs.existsSync(testFile));
});

test('loadJSON reads existing file', () => {
  fs.writeFileSync(testFile, JSON.stringify([{ id: 2 }]));
  const result = loadJSON(testFile, []);
  assert.deepEqual(result, [{ id: 2 }]);
});

test('loadJSON returns default on corrupt JSON', () => {
  fs.writeFileSync(testFile, 'not-json{{{');
  const result = loadJSON(testFile, ['fallback']);
  assert.deepEqual(result, ['fallback']);
});

test('saveJSON writes atomically (file is valid JSON after write)', () => {
  const data = [{ id: 3, value: 'test' }];
  saveJSON(testFile, data);
  const read = JSON.parse(fs.readFileSync(testFile, 'utf8'));
  assert.deepEqual(read, data);
});

test('saveJSON leaves no .tmp file on success', () => {
  saveJSON(testFile, [{ id: 4 }]);
  assert.ok(!fs.existsSync(testFile + '.tmp'));
});

test('ensureDataDir creates nested directory', () => {
  const nested = path.join(tmp, 'a', 'b', 'c');
  ensureDataDir(nested);
  assert.ok(fs.existsSync(nested));
});

test('loadWithSeed copies seed when data file missing', () => {
  const seedsDir = path.join(tmp, 'seeds');
  fs.mkdirSync(seedsDir, { recursive: true });
  const seedData = [{ id: 'seed-1' }];
  fs.writeFileSync(path.join(seedsDir, 'items.json'), JSON.stringify(seedData));
  const dataFile = path.join(tmp, 'items.json');
  const result = loadWithSeed(dataFile, 'items', seedsDir);
  assert.deepEqual(result, seedData);
  assert.ok(fs.existsSync(dataFile), 'data file should be created from seed');
});

test('loadWithSeed reads existing data file without touching seeds', () => {
  const seedsDir = path.join(tmp, 'seeds2');
  fs.mkdirSync(seedsDir, { recursive: true });
  const dataFile = path.join(tmp, 'items2.json');
  fs.writeFileSync(dataFile, JSON.stringify([{ id: 'existing' }]));
  const result = loadWithSeed(dataFile, 'items2', seedsDir);
  assert.deepEqual(result, [{ id: 'existing' }]);
});
