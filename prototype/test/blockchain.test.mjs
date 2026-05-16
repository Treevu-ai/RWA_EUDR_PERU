import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { BlockchainRepo } from '../lib/blockchain.js';
import { generateBlockHash } from '../services/apify-services.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rwa-blockchain-'));
const chainFile = path.join(tmp, 'chain.json');

test('BlockchainRepo initialises with a genesis block when no file exists', () => {
  const repo = new BlockchainRepo(chainFile);
  assert.equal(repo.length, 1);
  assert.equal(repo.lastBlock.index, 0);
  assert.equal(repo.lastBlock.previousHash, '0');
  assert.equal(repo.lastBlock.data.type, 'genesis');
});

test('BlockchainRepo genesis block hash is valid', () => {
  const repo = new BlockchainRepo(chainFile);
  const genesis = repo.lastBlock;
  const expected = generateBlockHash({
    index: genesis.index,
    timestamp: genesis.timestamp,
    data: genesis.data,
    previousHash: genesis.previousHash
  });
  assert.equal(genesis.hash, expected, 'genesis hash must match recomputed value');
});

test('addBlock increases chain length and links correctly', () => {
  const repo = new BlockchainRepo(chainFile);
  const before = repo.length;
  const block = repo.addBlock({ type: 'test_event', payload: 123 });
  assert.equal(repo.length, before + 1);
  assert.equal(block.previousHash, repo.tail(2)[0].hash);
});

test('addBlock block hash is deterministic', () => {
  const repo = new BlockchainRepo(chainFile);
  const block = repo.addBlock({ type: 'hash_test' });
  const expected = generateBlockHash({
    index: block.index,
    timestamp: block.timestamp,
    data: block.data,
    previousHash: block.previousHash
  });
  assert.equal(block.hash, expected);
});

test('verify returns { valid: true } on a healthy chain', () => {
  const repo = new BlockchainRepo(chainFile);
  repo.addBlock({ type: 'a' });
  repo.addBlock({ type: 'b' });
  const result = repo.verify();
  assert.equal(result.valid, true);
  assert.equal(result.height, repo.length);
});

test('verify detects a tampered previousHash', () => {
  // Create a new isolated chain file
  const brokenFile = path.join(tmp, 'broken.json');
  const repo = new BlockchainRepo(brokenFile);
  repo.addBlock({ type: 'a' });
  repo.addBlock({ type: 'b' });

  // Tamper directly with the persisted file
  const chain = JSON.parse(fs.readFileSync(brokenFile, 'utf8'));
  chain[2].previousHash = 'tampered000';
  fs.writeFileSync(brokenFile, JSON.stringify(chain));

  // Load fresh instance — should reset to genesis
  const loaded = new BlockchainRepo(brokenFile);
  assert.equal(loaded.length, 1, 'tampered chain should reset to genesis');
});

test('BlockchainRepo persists to disk: reloaded instance has same chain', () => {
  const persistFile = path.join(tmp, 'persist.json');
  const repo1 = new BlockchainRepo(persistFile);
  repo1.addBlock({ type: 'persisted_event' });
  const heightAfterWrite = repo1.length;

  const repo2 = new BlockchainRepo(persistFile);
  assert.equal(repo2.length, heightAfterWrite, 'reloaded chain should have same height');
  assert.equal(repo2.lastBlock.hash, repo1.lastBlock.hash, 'last block hash must match');
});
