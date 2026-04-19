/**
 * Copiloto EUDR — preparación documental y recuperación de fragmentos con citas.
 * No constituye asesoría legal; responsabilidad del operador económico.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DISCLAIMER_ES = [
  'Este asistente apoya la preparación documental y la organización de evidencias.',
  'No sustituye asesoría jurídica ni la obligación del operador económico respecto del Reglamento (UE) 2023/1115 y normativa aplicable.',
  'Verifique siempre el texto oficial en EUR-Lex y las guías vigentes de la Comisión Europea.'
].join(' ');

let knowledgeCache = null;
let checklistCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const p = path.join(__dirname, '..', 'data', 'eudr-knowledge.json');
  const raw = fs.readFileSync(p, 'utf8');
  knowledgeCache = JSON.parse(raw);
  return knowledgeCache;
}

function loadChecklist() {
  if (checklistCache) return checklistCache;
  const p = path.join(__dirname, '..', 'data', 'eudr-checklist.json');
  const raw = fs.readFileSync(p, 'utf8');
  checklistCache = JSON.parse(raw);
  return checklistCache;
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * Recuperación léxica simple (sin embeddings). Suficiente para MVP y transparencia.
 */
export function searchChunks(query, limit = 5) {
  const kb = loadKnowledge();
  const q = normalize(query);
  const words = q.split(/[\s,.;:]+/).filter((w) => w.length > 2);
  if (words.length === 0) return kb.chunks.slice(0, limit).map((c) => ({ ...c, score: 0 }));

  const scored = kb.chunks.map((chunk) => {
    const hay = normalize(`${chunk.title} ${chunk.text} ${(chunk.tags || []).join(' ')}`);
    let score = 0;
    for (const w of words) {
      if (hay.includes(w)) score += 1;
    }
    score /= Math.max(words.length, 1);
    return { ...chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);
  const positive = top.filter((c) => c.score > 0);
  if (positive.length) return positive;
  return kb.chunks.slice(0, limit).map((c) => ({ ...c, score: 0 }));
}

export function getCapabilities() {
  const kb = loadKnowledge();
  const hasLlm = Boolean(process.env.OPENAI_API_KEY);
  return {
    disclaimer: DISCLAIMER_ES,
    knowledgeVersion: kb.version,
    chunkCount: kb.chunks?.length || 0,
    checklistVersion: loadChecklist().version,
    llmAvailable: hasLlm,
    llmModel: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  };
}

export function getChecklist() {
  return loadChecklist();
}

/**
 * Cruza un lote demo con señales mínimas — ampliable cuando existan más evidencias en sistema.
 */
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
  const chunks = searchChunks(question, 6);
  const kb = loadKnowledge();

  const base = {
    disclaimer: DISCLAIMER_ES,
    knowledgeVersion: kb.version,
    chunks: chunks.map(({ id, title, text, source_citation, tags, score }) => ({
      id,
      title,
      text,
      source_citation,
      tags: tags || [],
      relevance: Number(score?.toFixed?.(3) ?? score)
    })),
    chunksUsed: chunks.map(({ id, title, source_citation, score }) => ({
      id,
      title,
      source_citation,
      relevance: Number(score?.toFixed?.(3) ?? score)
    })),
    retrievalOnlySummary:
      chunks.length > 0
        ? `Fragmentos recuperados por coincidencia léxica. Ver campo "chunks" y citas source_citation.`
        : 'Usando fragmentos base del corpus; amplía la pregunta (DDS, geolocalización, operador).'
  };

  if (!useLlm || !process.env.OPENAI_API_KEY) {
    return {
      ...base,
      mode: 'retrieval',
      answer: chunks.length
        ? `Modo recuperación: usa los textos en "chunks" [${chunks.map((c) => c.id).join(', ')}]. Para borrador redactado con LLM (opcional), define OPENAI_API_KEY y envía useLlm: true.`
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
