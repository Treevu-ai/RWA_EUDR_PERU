/**
 * Registro central de todos los repositorios y servicios con estado.
 * Importar desde aquí garantiza que cada repo sea un singleton.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { loadJSON } from './storage.js';
import { JsonRepo } from './repository.js';
import { BlockchainRepo } from './blockchain.js';
import { hashPassword } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.join(__dirname, '..', 'data');
export const SEEDS_DIR = path.join(__dirname, '..', 'seeds');

const files = {
  traces:     path.join(DATA_DIR, 'traces.json'),
  compliance: path.join(DATA_DIR, 'compliance-cache.json'),
  dds:        path.join(DATA_DIR, 'dds-reports.json'),
  blockchain: path.join(DATA_DIR, 'blockchain.json'),
  alerts:     path.join(DATA_DIR, 'alerts.json'),
  producers:  path.join(DATA_DIR, 'producers.json'),
  lots:       path.join(DATA_DIR, 'lots.json'),
  users:      path.join(DATA_DIR, 'users.json'),
  sessions:   path.join(DATA_DIR, 'sessions.json')
};

// SESSION_TTL: separar parse del cálculo facilita la validación del valor crudo.
const SESSION_TTL_HOURS_RAW = parseInt(process.env.SESSION_TTL_HOURS, 10);
export const SESSION_TTL_MS = (Number.isFinite(SESSION_TTL_HOURS_RAW) && SESSION_TTL_HOURS_RAW > 0
  ? SESSION_TTL_HOURS_RAW : 8) * 60 * 60 * 1000;

function defaultUsers() {
  return [
    { id: 'U-001', username: 'admin',    password: hashPassword('admin123'),    role: 'admin',    name: 'Administrador' },
    { id: 'U-002', username: 'operador', password: hashPassword('operador123'), role: 'operator', name: 'Operador' }
  ];
}

// ── Repositorios de dominio ──────────────────────────────────────────────────
export const producerRepo  = JsonRepo.fromSeed(files.producers, SEEDS_DIR, 'producers');
export const lotRepo       = JsonRepo.fromSeed(files.lots,      SEEDS_DIR, 'lots');
export const traceRepo     = JsonRepo.fromFile(files.traces,     []);
export const alertRepo     = JsonRepo.fromFile(files.alerts,     []);
export const userRepo      = JsonRepo.fromFile(files.users,      defaultUsers());
export const complianceRepo = JsonRepo.fromFile(files.compliance, []);
export const ddsRepo       = JsonRepo.fromFile(files.dds,        []);

// ── Blockchain ───────────────────────────────────────────────────────────────
export const blockchainSvc = new BlockchainRepo(files.blockchain);

// ── Sesiones: filtrar expiradas al arrancar ──────────────────────────────────
const now = Date.now();
const validSessions = loadJSON(files.sessions, []).filter(
  (s) => !s.expiresAt || now < new Date(s.expiresAt).getTime()
);
export const sessionRepo = new JsonRepo(files.sessions, validSessions);
sessionRepo.save(); // persistir set filtrado

// Limpieza periódica de sesiones expiradas
setInterval(() => {
  const fresh = sessionRepo.filter((s) => !s.expiresAt || Date.now() < new Date(s.expiresAt).getTime());
  if (fresh.length !== sessionRepo.length) sessionRepo.replace(fresh);
}, 10 * 60 * 1000);

// ── Estado compartido entre middleware y rutas de admin ──────────────────────
export const systemStats = {
  apiCalls: 0,
  get blocks() { return blockchainSvc.length; },
  lastUpdate: new Date().toISOString()
};

export const systemConfig = { threshold: 70, email: true, timezone: 'America/Lima' };

// ── Datos de mercado (estáticos para el prototipo) ───────────────────────────
export const marketStats = {
  cacao: { export2025: 1510000000, growth: '22%', topMarkets: ['EEUU', 'Países Bajos', 'Bélgica', 'Italia'], volumeMT: 169987 },
  cafe:  { export2025:  449000000, growth:  '7%', topMarkets: ['Alemania', 'EEUU', 'Bélgica'], volumeMT: 73450 },
  eudShare: '34%'
};
