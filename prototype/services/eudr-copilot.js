/**
 * Copiloto EUDR — preparación documental y recuperación híbrida (léxica + embeddings opcionales).
 * No constituye asesoría legal; responsabilidad del operador económico.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

const DISCLAIMER_ES = [
  'Este asistente apoya la preparación documental y la organización de evidencias.',
  'No sustituye asesoría jurídica ni la obligación del operador económico respecto del Reglamento (UE) 2023/1115 y normativa aplicable.',
  'Verifique siempre el texto oficial en EUR-Lex y las guías vigentes de la Comisión Europea.'
].join(' ');

let knowledgeCache = null;
let checklistCache = null;
/** Solo se cachea un índice cargado con éxito; si falta el archivo se reintenta en cada llamada. */
let embeddingsIndexLoaded = null;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export function appendCopilotAudit(entry) {
  try {
    ensureDataDir();
    const line =
      JSON.stringify({
        ...entry,
        ts: new Date().toISOString()
      }) + '\n';
    fs.appendFileSync(path.join(dataDir, 'copilot-audit.jsonl'), line, 'utf8');
  } catch {
    // no bloquear la petición si falla el log
  }
}

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const p = path.join(dataDir, 'eudr-knowledge.json');
  const raw = fs.readFileSync(p, 'utf8');
  knowledgeCache = JSON.parse(raw);
  return knowledgeCache;
}

function loadChecklist() {
  if (checklistCache) return checklistCache;
  const p = path.join(dataDir, 'eudr-checklist.json');
  const raw = fs.readFileSync(p, 'utf8');
  checklistCache = JSON.parse(raw);
  return checklistCache;
}

export function getEurlexReferences() {
  const p = path.join(dataDir, 'eurlex-references.json');
  if (!fs.existsSync(p)) return { version: null, acts: [], portals: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadEmbeddingsIndex() {
  if (embeddingsIndexLoaded) return embeddingsIndexLoaded;
  const p = path.join(dataDir, 'eudr-knowledge.embeddings.json');
  if (!fs.existsSync(p)) return null;
  try {
    embeddingsIndexLoaded = JSON.parse(fs.readFileSync(p, 'utf8'));
    return embeddingsIndexLoaded;
  } catch {
    return null;
  }
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Puntuación léxica 0–1 por chunk */
function lexicalScores(query) {
  const kb = loadKnowledge();
  const q = normalize(query);
  const words = q.split(/[\s,.;:]+/).filter((w) => w.length > 2);
  if (words.length === 0) {
    return kb.chunks.map((chunk) => ({ chunk: { ...chunk }, lex: 0 }));
  }
  return kb.chunks.map((chunk) => {
    const hay = normalize(`${chunk.title} ${chunk.text} ${(chunk.tags || []).join(' ')}`);
    let score = 0;
    for (const w of words) {
      if (hay.includes(w)) score += 1;
    }
    score /= Math.max(words.length, 1);
    return { chunk: { ...chunk }, lex: score };
  });
}

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

async function embedQuery(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, input: text.slice(0, 8000) })
  });
  if (!res.ok) return null;
  const j = await res.json();
  return j.data?.[0]?.embedding || null;
}

/**
 * Recuperación léxica (sync) — compatibilidad.
 */
export function searchChunks(query, limit = 5) {
  const scored = lexicalScores(query);
  scored.sort((a, b) => b.lex - a.lex);
  const top = scored.slice(0, limit * 2);
  const positive = top.filter((c) => c.lex > 0);
  const pick = positive.length ? positive.slice(0, limit) : scored.slice(0, limit);
  return pick.map(({ chunk, lex }) => ({ ...chunk, score: lex }));
}

/**
 * Recuperación híbrida: léxica + similitud coseno si hay índice de embeddings y API key para la consulta.
 */
export async function retrieveChunks(query, limit = 6) {
  const lexList = lexicalScores(query);
  const maxLex = Math.max(...lexList.map((x) => x.lex), 1e-9);
  const embIdx = loadEmbeddingsIndex();
  const qEmb = embIdx && process.env.OPENAI_API_KEY ? await embedQuery(query) : null;

  if (!embIdx || !qEmb) {
    lexList.sort((a, b) => b.lex - a.lex);
    const top = lexList.slice(0, limit);
    const positive = top.filter((c) => c.lex > 0);
    const pick = positive.length ? positive.slice(0, limit) : lexList.slice(0, limit);
    return {
      retrievalMode: 'lexical',
      chunks: pick.map(({ chunk, lex }) => ({
        ...chunk,
        score: lex,
        lexicalScore: Number((lex / maxLex).toFixed(4)),
        cosineScore: null
      })),
      embeddingModel: embIdx?.model || null,
      hybridAvailable: Boolean(embIdx && process.env.OPENAI_API_KEY)
    };
  }

  const vecById = Object.fromEntries(embIdx.vectors.map((v) => [v.id, v.embedding]));
  const merged = lexList.map(({ chunk, lex }) => {
    const vec = vecById[chunk.id];
    const cos = vec ? cosineSimilarity(qEmb, vec) : 0;
    const lexN = lex / maxLex;
    const hybrid = 0.48 * cos + 0.52 * lexN;
    return {
      ...chunk,
      score: hybrid,
      lexicalScore: Number(lexN.toFixed(4)),
      cosineScore: Number(cos.toFixed(4))
    };
  });
  merged.sort((a, b) => b.score - a.score);
  return {
    retrievalMode: 'hybrid',
    chunks: merged.slice(0, limit),
    embeddingModel: embIdx.model,
    hybridAvailable: true
  };
}

export function getCapabilities() {
  const kb = loadKnowledge();
  const embIdx = loadEmbeddingsIndex();
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  return {
    disclaimer: DISCLAIMER_ES,
    knowledgeVersion: kb.version,
    chunkCount: kb.chunks?.length || 0,
    checklistVersion: loadChecklist().version,
    llmAvailable: hasKey,
    llmModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    embeddingIndexPresent: Boolean(embIdx),
    embeddingModel: embIdx?.model || (hasKey ? process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small' : null),
    hybridRetrievalReady: Boolean(embIdx && hasKey),
    eurlexRefsVersion: getEurlexReferences().version
  };
}

export function getChecklist() {
  return loadChecklist();
}

export function analyzeGaps(lot = {}) {
  const checklist = loadChecklist();
  const latOk = lot.lat != null && lot.lon != null && Number.isFinite(Number(lot.lat)) && Number.isFinite(Number(lot.lon));
  const lat = Number(lot.lat);
  const lon = Number(lot.lon);
  const geoRangeOk = latOk && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

  const automatedSignals = checklist.items
    .filter((i) => i.lot_field === 'geo')
    .map((item) => ({
      ...item,
      status: geoRangeOk ? 'signal_ok' : 'gap',
      detail: geoRangeOk
        ? 'Coordenadas numéricas presentes y en rango WGS84 en el lote seleccionado (demo).'
        : 'Faltan coordenadas válidas en el lote — revisar captura en campo o datos de integración.'
    }));

  const manualReview = checklist.items
    .filter((i) => !i.lot_field)
    .map((item) => ({
      ...item,
      status: 'manual_review',
      detail: item.hint
    }));

  const summary = geoRangeOk
    ? `Señal automática (demo): coordenadas detectadas en el lote. ${manualReview.length} ítems requieren evidencia y juicio profesional fuera del prototipo.`
    : `Sin señal geo válida en el lote seleccionado. ${manualReview.length} ítems siguen requiriendo revisión manual y asesoría cualificada.`;

  return {
    disclaimer: DISCLAIMER_ES,
    checklistVersion: checklist.version,
    lotId: lot.id || null,
    summary,
    signals: { geoPresent: geoRangeOk },
    automatedSignals,
    manualReview
  };
}

function buildContextBlock(chunks) {
  return chunks
    .map((c) => `[${c.id}] ${c.title}\nFuente citada: ${c.source_citation}\n${c.text}`)
    .join('\n\n---\n\n');
}

export async function queryCopilot(question, { useLlm = false } = {}) {
  const { chunks, retrievalMode, embeddingModel, hybridAvailable } = await retrieveChunks(question, 6);
  const kb = loadKnowledge();

  const base = {
    disclaimer: DISCLAIMER_ES,
    knowledgeVersion: kb.version,
    retrievalMode,
    embeddingModel: embeddingModel || null,
    hybridAvailable,
    chunks: chunks.map(({ id, title, text, source_citation, tags, score, lexicalScore, cosineScore }) => ({
      id,
      title,
      text,
      source_citation,
      tags: tags || [],
      relevance: Number(score?.toFixed?.(4) ?? score),
      lexicalScore: lexicalScore ?? null,
      cosineScore: cosineScore ?? null
    })),
    chunksUsed: chunks.map(({ id, title, source_citation, score }) => ({
      id,
      title,
      source_citation,
      relevance: Number(score?.toFixed?.(4) ?? score)
    })),
    retrievalOnlySummary:
      retrievalMode === 'hybrid'
        ? 'Recuperación híbrida (embeddings + léxica). Revise lexicalScore / cosineScore por fragmento.'
        : 'Recuperación léxica; genere índice con npm run embed-corpus y OPENAI_API_KEY para activar modo híbrido.'
  };

  if (!useLlm || !process.env.OPENAI_API_KEY) {
    return {
      ...base,
      mode: 'retrieval',
      answer: chunks.length
        ? `Modo recuperación (${retrievalMode}): fragmentos [${chunks.map((c) => c.id).join(', ')}]. Opcional: useLlm: true para borrador redactado.`
        : 'Corpus no disponible.'
    };
  }

  const context = buildContextBlock(chunks);
  const system = [
    'Eres un asistente de preparación documental para el marco EUDR (Reglamento UE 2023/1115).',
    'NO eres abogado. NO afirmes cumplimiento legal.',
    'Usa SOLO el CONTEXTO; cada afirmación debe referenciar [id] del fragmento.',
    'Si el CONTEXTO no alcanza, dilo explícitamente.',
    'Responde en español, tono profesional y conciso.',
    'Empieza con una frase recordando que la responsabilidad es del operador económico.'
  ].join(' ');

  const userMsg = `CONTEXTO:\n${context}\n\nPREGUNTA:\n${question}`;

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMsg }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      ...base,
      mode: 'error',
      answer: null,
      error: `OpenAI error: ${res.status} ${errText.slice(0, 400)}`
    };
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content || '';

  return {
    ...base,
    mode: 'assisted',
    answer
  };
}
