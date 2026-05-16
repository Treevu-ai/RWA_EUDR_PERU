import fs from 'fs';
import path from 'path';

export function ensureDataDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadJSON(filePath, defaultValue = []) {
  ensureDataDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultValue));
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return defaultValue; }
}

export function saveJSON(filePath, data) {
  // Escritura atómica: primero al temporal, luego rename.
  // Si el proceso se interrumpe a mitad el archivo original queda intacto.
  const tmp = filePath + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch { /* ya no existe, ok */ }
    console.error(`[saveJSON] Error escribiendo ${path.basename(filePath)}:`, err.message);
    throw err;
  }
}

/** Si el archivo de datos no existe, lo inicializa copiando desde seeds/. */
export function loadWithSeed(dataPath, seedName, seedsDir) {
  ensureDataDir(path.dirname(dataPath));
  if (!fs.existsSync(dataPath)) {
    const seedPath = path.join(seedsDir, `${seedName}.json`);
    if (fs.existsSync(seedPath)) {
      try {
        const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
        fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2));
        return seed;
      } catch (e) {
        console.error(`Error loading seed ${seedName}:`, e.message);
      }
    }
  }
  return loadJSON(dataPath, []);
}
