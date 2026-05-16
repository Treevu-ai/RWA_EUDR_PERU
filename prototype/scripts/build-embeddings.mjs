#!/usr/bin/env node
/**
 * Genera eudr-knowledge.embeddings.json a partir del corpus.
 * Requiere: OPENAI_API_KEY
 * Uso: desde prototype/: npm run embed-corpus
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Carga opcional prototype/.env sin dependencia dotenv (no sobrescribe variables ya definidas en el shell). */
function loadPrototypeEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (let line of raw.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadPrototypeEnv();
const key = process.env.OPENAI_API_KEY;

if (!key) {
  console.error(
    'Defina OPENAI_API_KEY (variable de entorno o en prototype/.env) para generar embeddings del corpus.'
  );
  process.exit(1);
}

const kb = JSON.parse(fs.readFileSync(path.join(root, 'data', 'eudr-knowledge.json'), 'utf8'));
const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, input: text })
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.data[0].embedding;
}

const vectors = [];
for (const c of kb.chunks) {
  const input = `${c.title}\n${c.text}\n${(c.tags || []).join(' ')}`;
  const embedding = await embed(input);
  vectors.push({ id: c.id, embedding });
  console.log('OK', c.id);
}

const out = {
  model,
  dimensions: vectors[0]?.embedding?.length ?? 0,
  knowledgeVersion: kb.version,
  builtAt: new Date().toISOString(),
  vectors
};

const outPath = path.join(root, 'data', 'eudr-knowledge.embeddings.json');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log('Escrito:', outPath);
