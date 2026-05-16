import { loadJSON, saveJSON } from './storage.js';
import { generateBlockHash } from '../services/apify-services.js';

/**
 * Gestiona la cadena de bloques local: carga, valida integridad al arrancar,
 * y expone addBlock() / verify() para el resto de la aplicación.
 */
export class BlockchainRepo {
  #filePath;
  #chain;

  constructor(filePath) {
    this.#filePath = filePath;
    this.#chain = this._loadAndValidate();
  }

  get length() { return this.#chain.length; }
  get lastBlock() { return this.#chain[this.#chain.length - 1]; }

  tail(n = 40) { return this.#chain.slice(-n); }

  addBlock(data) {
    const prev = this.lastBlock;
    // Se captura el timestamp una sola vez para que el contenido del bloque
    // y su firma usen exactamente el mismo valor.
    const timestamp = new Date().toISOString();
    const block = {
      index: prev.index + 1,
      timestamp,
      data,
      previousHash: prev.hash,
      hash: generateBlockHash({ index: prev.index + 1, timestamp, data, previousHash: prev.hash })
    };
    this.#chain.push(block);
    saveJSON(this.#filePath, this.#chain);
    return block;
  }

  verify() {
    if (this.#chain.length === 0) return { valid: false, reason: 'empty', height: 0 };
    for (let i = 1; i < this.#chain.length; i++) {
      const block = this.#chain[i];
      const prev = this.#chain[i - 1];
      if (block.previousHash !== prev.hash) {
        return { valid: false, reason: 'previousHash_mismatch', atIndex: i, height: this.#chain.length };
      }
      const expected = generateBlockHash({
        index: block.index, timestamp: block.timestamp,
        data: block.data, previousHash: block.previousHash
      });
      if (block.hash !== expected) {
        return { valid: false, reason: 'hash_mismatch', atIndex: i, height: this.#chain.length };
      }
    }
    return { valid: true, height: this.#chain.length };
  }

  _loadAndValidate() {
    const chain = loadJSON(this.#filePath, []);
    if (chain.length === 0) return this._createFreshGenesis();
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const prev = chain[i - 1];
      const expected = generateBlockHash({
        index: block.index, timestamp: block.timestamp,
        data: block.data, previousHash: block.previousHash
      });
      if (block.previousHash !== prev.hash || block.hash !== expected) {
        console.warn(`⚠️  Blockchain: inconsistencia en bloque ${i}. Reiniciando cadena.`);
        return this._createFreshGenesis();
      }
    }
    return chain;
  }

  _createFreshGenesis() {
    const ts = new Date().toISOString();
    const genesis = {
      index: 0,
      timestamp: ts,
      data: { type: 'genesis', message: 'RWA EUDR Blockchain - Trazabilidad Agroexportadora' },
      previousHash: '0'
    };
    genesis.hash = generateBlockHash(genesis);
    const chain = [genesis];
    saveJSON(this.#filePath, chain);
    return chain;
  }
}
