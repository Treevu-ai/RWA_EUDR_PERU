import { loadJSON, saveJSON, loadWithSeed } from './storage.js';

/**
 * Repositorio genérico de datos JSON persistidos en disco.
 * Encapsula el estado en memoria y sincroniza a disco en cada mutación.
 * Permite sustituir el storage por SQLite / Postgres cambiando solo esta clase.
 */
export class JsonRepo {
  #data;
  #filePath;

  constructor(filePath, initialData) {
    this.#filePath = filePath;
    this.#data = initialData;
  }

  /** Carga desde archivo; usa defaultValue si el archivo no existe. */
  static fromFile(filePath, defaultValue = []) {
    return new JsonRepo(filePath, loadJSON(filePath, defaultValue));
  }

  /** Carga desde archivo; si no existe lo inicializa desde seeds/. */
  static fromSeed(filePath, seedsDir, seedName) {
    return new JsonRepo(filePath, loadWithSeed(filePath, seedName, seedsDir));
  }

  get length() { return this.#data.length; }

  /** Copia superficial para evitar mutación externa accidental. */
  all() { return [...this.#data]; }

  findById(id) { return this.#data.find((x) => x.id === id); }
  findIndex(id) { return this.#data.findIndex((x) => x.id === id); }
  findOne(fn) { return this.#data.find(fn); }
  filter(fn) { return this.#data.filter(fn); }
  slice(...args) { return this.#data.slice(...args); }
  reduce(...args) { return this.#data.reduce(...args); }

  push(item) {
    this.#data.push(item);
    this.save();
    return item;
  }

  /** Aplica patch al elemento en posición idx; añade updatedAt automáticamente. */
  updateAt(idx, patch) {
    this.#data[idx] = { ...this.#data[idx], ...patch, updatedAt: new Date().toISOString() };
    this.save();
    return this.#data[idx];
  }

  removeAt(idx) {
    const deleted = this.#data.splice(idx, 1)[0];
    this.save();
    return deleted;
  }

  /** Reemplaza todo el contenido y persiste. Útil para filtrado bulk (ej. sesiones caducadas). */
  replace(newData) {
    this.#data = [...newData];
    this.save();
  }

  /** Elimina las entradas más antiguas conservando solo las últimas maxLen. */
  trim(maxLen) {
    if (this.#data.length > maxLen) {
      this.#data = this.#data.slice(-maxLen);
      this.save();
    }
  }

  save() {
    saveJSON(this.#filePath, this.#data);
  }
}
