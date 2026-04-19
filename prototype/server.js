import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import crypto from 'crypto';
import net from 'net';
import { fileURLToPath } from 'url';
import {
  apifyServices,
  getServiceStatus,
  executeService,
  hashData,
  generateBlockHash,
  calculateWeightedComplianceScore,
  determineComplianceStatus,
  generateEvidenceHash,
  cache
} from './services/apify-services.js';
import {
  getCapabilities,
  getChecklist,
  getEurlexReferences,
  analyzeGaps,
  queryCopilot,
  appendCopilotAudit
} from './services/eudr-copilot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

/** Cabeceras HTTP mínimas; en producción completar con TLS y proxy (nginx, etc.). */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
const dataDir = path.join(__dirname, 'data');

const files = {
  traces: path.join(dataDir, 'traces.json'),
  compliance: path.join(dataDir, 'compliance-cache.json'),
  dds: path.join(dataDir, 'dds-reports.json'),
  blockchain: path.join(dataDir, 'blockchain.json'),
  alerts: path.join(dataDir, 'alerts.json'),
  producers: path.join(dataDir, 'producers.json'),
  lots: path.join(dataDir, 'lots.json'),
  users: path.join(dataDir, 'users.json')
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function loadJSON(filePath, defaultValue = []) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultValue));
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return defaultValue; }
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let producers = loadJSON(files.producers, [
  { id: 'P-001', name: 'Cooperativa Agraria APROCAM', region: 'San Martín', hectares: 450, status: 'Conectado', digitalMaturity: 'Intermedia', members: 180, lat: -6.5217, lon: -76.3823, certifications: ['Fairtrade', 'Orgánico', 'Rainforest'], createdAt: new Date().toISOString() },
  { id: 'P-002', name: 'Juan Huaman (Café)', region: 'Cajamarca', hectares: 2.5, status: 'Registrado', digitalMaturity: 'Inicial', members: 1, lat: -7.1567, lon: -78.5133, certifications: ['UTZ'], createdAt: new Date().toISOString() },
  { id: 'P-003', name: 'María Quispe Exports', region: 'Piura', hectares: 12, status: 'Verificado', digitalMaturity: 'Avanzada', members: 1, lat: -5.1947, lon: -80.6323, certifications: ['Kosher', 'Orgánico', 'B Corp'], createdAt: new Date().toISOString() },
  { id: 'P-004', name: 'Orgánicos del Vraem', region: 'Junín', hectares: 85, status: 'Conectado', digitalMaturity: 'Básica', members: 45, lat: -11.1234, lon: -74.5678, certifications: ['Fairtrade'], createdAt: new Date().toISOString() },
  { id: 'P-005', name: 'Central Café del Norte', region: 'Cajamarca', hectares: 320, status: 'Conectado', digitalMaturity: 'Avanzada', members: 120, lat: -6.8714, lon: -78.1234, certifications: ['Fairtrade', '4C', 'UTZ'], createdAt: new Date().toISOString() },
  { id: 'P-006', name: 'Cooperativa Tocache Cacao', region: 'San Martín', hectares: 280, status: 'Conectado', digitalMaturity: 'Intermedia', members: 95, lat: -8.1893, lon: -76.5123, certifications: ['Orgánico', 'Fairtrade'], createdAt: new Date().toISOString() },
  { id: 'P-007', name: 'Agricultores de Quillabamba', region: 'Cusco', hectares: 45, status: 'Registrado', digitalMaturity: 'Inicial', members: 22, lat: -12.8654, lon: -72.6987, certifications: ['UTZ'], createdAt: new Date().toISOString() },
  { id: 'P-008', name: 'Exportadora Peruana SA', region: 'Lambayeque', hectares: 150, status: 'Verificado', digitalMaturity: 'Avanzada', members: 60, lat: -6.4817, lon: -79.8542, certifications: ['Orgánico', 'BRC', 'ISO22000'], createdAt: new Date().toISOString() },
  { id: 'P-009', name: 'Café Altomayo', region: 'Amazonas', hectares: 180, status: 'Conectado', digitalMaturity: 'Intermedia', members: 75, lat: -5.5612, lon: -77.8123, certifications: ['Fairtrade', 'Rainforest', 'Orgánico'], createdAt: new Date().toISOString() },
  { id: 'P-010', name: 'Cooperativa Pangoa', region: 'Junín', hectares: 95, status: 'Conectado', digitalMaturity: 'Básica', members: 38, lat: -10.9234, lon: -74.1234, certifications: ['Fairtrade', 'UTZ'], createdAt: new Date().toISOString() }
]);

let lots = loadJSON(files.lots, [
  { id: 'CAC-2026-001', producer: 'APROCAM', product: 'Cacao', parcel: 'PAR-045', eudr: 'Verificado', status: 'Exportado', weightKg: 4500, destination: 'Países Bajos', pricePerKg: 9.20, certification: 'Fairtrade Orgánico', lat: -6.4852, lon: -76.3671, createdAt: new Date().toISOString() },
  { id: 'CAF-2026-012', producer: 'Juan Huaman', product: 'Café', parcel: 'PAR-071', eudr: 'Pendiente', status: 'Acopiado', weightKg: 820, destination: 'Alemania', pricePerKg: 8.50, certification: 'UTZ', lat: -7.1567, lon: -78.5133, createdAt: new Date().toISOString() },
  { id: 'CAC-2026-008', producer: 'APROCAM', product: 'Cacao', parcel: 'PAR-022', eudr: 'Verificado', status: 'En destino', weightKg: 2800, destination: 'Bélgica', pricePerKg: 8.80, certification: 'Orgánico UE', lat: -6.5012, lon: -76.3901, createdAt: new Date().toISOString() },
  { id: 'QNA-2026-003', producer: 'María Quispe', product: 'Quinua', parcel: 'PAR-089', eudr: 'Verificado', status: 'Embalado', weightKg: 1200, destination: 'España', pricePerKg: 4.20, certification: 'Kosher', lat: -5.1947, lon: -80.6323, createdAt: new Date().toISOString() },
  { id: 'CAF-2026-015', producer: 'Central Café del Norte', product: 'Café', parcel: 'PAR-102', eudr: 'Verificado', status: 'En tránsito', weightKg: 6500, destination: 'Italia', pricePerKg: 8.75, certification: 'Fairtrade 4C', lat: -6.8714, lon: -78.1234, createdAt: new Date().toISOString() },
  { id: 'CAC-2026-012', producer: 'Cooperativa Tocache Cacao', product: 'Cacao', parcel: 'PAR-203', eudr: 'Verificado', status: 'Registrado', weightKg: 3200, destination: 'Países Bajos', pricePerKg: 9.40, certification: 'Fairtrade Orgánico', lat: -8.1893, lon: -76.5123, createdAt: new Date().toISOString() },
  { id: 'CAF-2026-018', producer: 'Café Altomayo', product: 'Café', parcel: 'PAR-305', eudr: 'Pendiente', status: 'Cosecha', weightKg: 1800, destination: 'Francia', pricePerKg: 9.10, certification: 'Rainforest Orgánico', lat: -5.5612, lon: -77.8123, createdAt: new Date().toISOString() },
  { id: 'CAC-2026-015', producer: 'Cooperativa Pangoa', product: 'Cacao', parcel: 'PAR-401', eudr: 'Verificado', status: 'Acopiado', weightKg: 2100, destination: 'Bélgica', pricePerKg: 8.95, certification: 'Fairtrade UTZ', lat: -10.9234, lon: -74.1234, createdAt: new Date().toISOString() },
  { id: 'CAF-2026-020', producer: 'Agricultores de Quillabamba', product: 'Café', parcel: 'PAR-501', eudr: 'Pendiente', status: 'Certificación', weightKg: 950, destination: 'Suecia', pricePerKg: 7.80, certification: 'UTZ', lat: -12.8654, lon: -72.6987, createdAt: new Date().toISOString() },
  { id: 'CAC-2026-018', producer: 'Exportadora Peruana SA', product: 'Cacao', parcel: 'PAR-601', eudr: 'Verificado', status: 'Embalado', weightKg: 5800, destination: 'Alemania', pricePerKg: 9.60, certification: 'Orgánico BRC ISO', lat: -6.4817, lon: -79.8542, createdAt: new Date().toISOString() }
]);

let blockchain = loadJSON(files.blockchain, [{
  index: 0, timestamp: new Date().toISOString(),
  data: { type: 'genesis', message: 'RWA EUDR Blockchain - Trazabilidad Agroexportadora' },
  previousHash: '0', hash: hashData({ index: 0, timestamp: new Date().toISOString() })
}]);

let traceHistory = loadJSON(files.traces, []);
let alerts = loadJSON(files.alerts, []);
let users = loadJSON(files.users, [
  { id: 'U-001', username: 'admin', password: hashData('admin123'), role: 'admin', name: 'Administrador' },
  { id: 'U-002', username: 'operador', password: hashData('operador123'), role: 'operator', name: 'Operador' }
]);

let complianceReports = loadJSON(files.compliance, []);
let ddsReports = loadJSON(files.dds, []);
let sessions = [];

const marketStats = {
  cacao: { export2025: 1510000000, growth: '22%', topMarkets: ['EEUU', 'Países Bajos', 'Bélgica', 'Italia'], volumeMT: 169987 },
  cafe: { export2025: 449000000, growth: '7%', topMarkets: ['Alemania', 'EEUU', 'Bélgica'], volumeMT: 73450 },
  eudShare: '34%'
};

app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use((req, res, next) => { systemStats.apiCalls++; next(); });

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function addBlock(data) {
  const prev = blockchain[blockchain.length - 1];
  const block = {
    index: prev.index + 1,
    timestamp: new Date().toISOString(),
    data,
    previousHash: prev.hash,
    hash: generateBlockHash({ index: prev.index + 1, timestamp: new Date().toISOString(), data, previousHash: prev.hash })
  };
  blockchain.push(block);
  saveJSON(files.blockchain, blockchain);
  return block;
}

function normalizeCoordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildGeoEvidence(lot) {
  const lat = normalizeCoordinate(lot?.lat);
  const lon = normalizeCoordinate(lot?.lon);
  const hasCoordinates = lat !== null && lon !== null;
  const coordinateValidRange = hasCoordinates && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  const precisionScore = coordinateValidRange
    ? Math.min(100, Math.round(((String(Math.abs(lat)).split('.')[1]?.length || 0) + (String(Math.abs(lon)).split('.')[1]?.length || 0)) * 8))
    : 0;
  const polygon = coordinateValidRange
    ? [
      [Number((lat - 0.0015).toFixed(6)), Number((lon - 0.0015).toFixed(6))],
      [Number((lat - 0.0015).toFixed(6)), Number((lon + 0.0015).toFixed(6))],
      [Number((lat + 0.0015).toFixed(6)), Number((lon + 0.0015).toFixed(6))],
      [Number((lat + 0.0015).toFixed(6)), Number((lon - 0.0015).toFixed(6))]
    ]
    : [];
  const evidence = {
    hasCoordinates: coordinateValidRange,
    lat,
    lon,
    parcelId: lot?.parcel || null,
    polygonWgs84: polygon,
    source: 'producer_declaration',
    cutOffDate: '2020-12-31',
    deforestationAssessment: coordinateValidRange ? 'PENDING_EXTERNAL_VALIDATION' : 'INSUFFICIENT_GEO_DATA'
  };
  return {
    ...evidence,
    precisionScore,
    hash: generateEvidenceHash('geo', evidence)
  };
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.find(s => s.token === token);
  if (!session) return res.status(401).json({ error: 'No autorizado' });
  req.user = session;
  next();
}

// ============== AUTH ==============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === hashData(password));
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  
  const token = hashData(username + Date.now());
  sessions.push({ token, userId: user.id, username: user.username, role: user.role, createdAt: new Date().toISOString() });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  sessions = sessions.filter(s => s.token !== req.headers.authorization?.replace('Bearer ', ''));
  res.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ============== DATA ==============
app.get('/api/data', authMiddleware, (req, res) => {
  res.json({
    producers,
    lots,
    traceCount: traceHistory.length,
    marketStats,
    blockchainInfo: { height: blockchain.length, lastHash: blockchain[blockchain.length - 1]?.hash }
  });
});

// ============== SERVICES (Apify / mock) ==============
app.get('/api/services/status', authMiddleware, async (req, res) => {
  try {
    const status = await getServiceStatus();
    res.json({ status, weights: COMPLIANCE_WEIGHTS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services/:serviceName', authMiddleware, async (req, res) => {
  const { serviceName } = req.params;
  const lat = req.query.lat != null ? parseFloat(req.query.lat) : undefined;
  const lon = req.query.lon != null ? parseFloat(req.query.lon) : undefined;
  const params = { ...req.query };
  delete params.lat;
  delete params.lon;
  if (lat != null && !Number.isNaN(lat)) params.lat = lat;
  if (lon != null && !Number.isNaN(lon)) params.lon = lon;
  try {
    const result = await executeService(serviceName, params);
    if (result?.error) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============== BLOCKCHAIN (cadena local) ==============
app.get('/api/blockchain', authMiddleware, (req, res) => {
  const tail = blockchain.slice(-40);
  res.json({
    height: blockchain.length,
    lastHash: blockchain[blockchain.length - 1]?.hash,
    chain: tail
  });
});

app.get('/api/blockchain/verify', authMiddleware, (req, res) => {
  if (blockchain.length === 0) {
    return res.json({ valid: false, reason: 'empty', height: 0 });
  }
  for (let i = 1; i < blockchain.length; i++) {
    const block = blockchain[i];
    const prev = blockchain[i - 1];
    if (block.previousHash !== prev.hash) {
      return res.json({ valid: false, reason: 'previousHash_mismatch', atIndex: i, height: blockchain.length });
    }
    const expected = generateBlockHash({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash
    });
    if (block.hash !== expected) {
      return res.json({ valid: false, reason: 'hash_mismatch', atIndex: i, height: blockchain.length });
    }
  }
  res.json({ valid: true, height: blockchain.length });
});

// ============== PRODUCERS CRUD ==============
app.get('/api/producers', authMiddleware, (req, res) => {
  res.json({ producers });
});

app.post('/api/producers', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const { name, region, hectares, digitalMaturity, members, lat, lon, certifications } = req.body;
  const producer = {
    id: generateId('P'),
    name, region, hectares, digitalMaturity: digitalMaturity || 'Inicial',
    members: members || 1, lat, lon, certifications: certifications || [],
    status: 'Registrado', createdAt: new Date().toISOString()
  };
  producers.push(producer);
  saveJSON(files.producers, producers);
  addBlock({ type: 'producer_created', producer });
  res.json({ producer });
});

app.put('/api/producers/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = producers.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  producers[idx] = { ...producers[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveJSON(files.producers, producers);
  addBlock({ type: 'producer_updated', producer: producers[idx] });
  res.json({ producer: producers[idx] });
});

app.delete('/api/producers/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = producers.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  const deleted = producers.splice(idx, 1)[0];
  saveJSON(files.producers, producers);
  addBlock({ type: 'producer_deleted', producerId: deleted.id });
  res.json({ success: true });
});

// ============== LOTS CRUD ==============
app.get('/api/lots', authMiddleware, (req, res) => {
  res.json({ lots });
});

app.post('/api/lots', authMiddleware, (req, res) => {
  const { producer, product, parcel, eudr, status, weightKg, destination, pricePerKg, certification, lat, lon } = req.body;
  const lot = {
    id: generateId(product?.substring(0, 3) || 'LOT'),
    producer, product, parcel, eudr: eudr || 'Pendiente',
    status: status || 'Registrado', weightKg, destination, pricePerKg, certification,
    lat, lon, createdAt: new Date().toISOString()
  };
  lots.push(lot);
  saveJSON(files.lots, lots);
  addBlock({ type: 'lot_created', lot });
  res.json({ lot });
});

app.put('/api/lots/:id', authMiddleware, (req, res) => {
  const idx = lots.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  lots[idx] = { ...lots[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveJSON(files.lots, lots);
  addBlock({ type: 'lot_updated', lot: lots[idx] });
  res.json({ lot: lots[idx] });
});

app.delete('/api/lots/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = lots.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  lots.splice(idx, 1);
  saveJSON(files.lots, lots);
  res.json({ success: true });
});

// ============== COMPLIANCE ==============
app.post('/api/compliance/check', authMiddleware, async (req, res) => {
  try {
    const { lotId, parcelId, producer, region, product, lat, lon } = req.body;
    
    const checks = await Promise.allSettled([
      executeService('euCompliance', { regulation: 'EUDR' }),
      executeService('weather', { lat: lat || -6.78, lon: lon || -76.03 }),
      executeService('supplyChain', { region: region || 'Perú' }),
      executeService('geolocation', { search: parcelId, location: region })
    ]);

    const weightedScore = calculateWeightedComplianceScore(checks);
    const status = determineComplianceStatus(weightedScore);
    
    const weatherData = checks[1].value?.data;
    const weatherEvidence = weatherData ? {
      location: weatherData.location,
      conditions: weatherData.current,
      timestamp: weatherData.timestamp,
      hash: generateEvidenceHash('weather', weatherData)
    } : null;

    const block = addBlock({
      type: 'weather_evidence',
      lotId,
      weather: weatherEvidence,
      complianceScore: weightedScore
    });

    const report = {
      id: generateId('CR'),
      lotId, parcelId, timestamp: new Date().toISOString(),
      checks: {
        euRegulations: checks[0].status === 'fulfilled' ? checks[0].value : { error: 'Falló' },
        weather: checks[1].status === 'fulfilled' ? checks[1].value : { error: 'Falló' },
        supplyChain: checks[2].status === 'fulfilled' ? checks[2].value : { error: 'Falló' },
        geolocation: checks[3].status === 'fulfilled' ? checks[3].value : { error: 'Falló' }
      },
      weightedScore, status, weatherEvidence,
      blockHash: block.hash,
      hash: hashData({ lotId, timestamp: new Date().toISOString(), score: weightedScore })
    };

    complianceReports.push(report);
    if (complianceReports.length > 100) complianceReports = complianceReports.slice(-100);
    saveJSON(files.compliance, complianceReports);

    const newAlerts = [];
    if (checks[2].value?.data?.alerts) {
      checks[2].value.data.alerts.forEach(alert => {
        newAlerts.push({ id: generateId('ALR'), lotId, type: alert.type, severity: alert.severity, message: alert.message, action: alert.action, timestamp: new Date().toISOString(), read: false });
      });
    }
    alerts = [...newAlerts, ...alerts].slice(0, 50);
    saveJSON(files.alerts, alerts);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compliance/reports', authMiddleware, (req, res) => {
  res.json({ reports: complianceReports.slice(-50).reverse() });
});

app.get('/api/compliance/summary', authMiddleware, (req, res) => {
  const summary = {
    total: complianceReports.length,
    compliant: complianceReports.filter(r => r.status === 'COMPLIANT').length,
    partial: complianceReports.filter(r => r.status === 'PARTIAL').length,
    nonCompliant: complianceReports.filter(r => r.status === 'NON_COMPLIANT').length,
    avgScore: complianceReports.length ? Math.round(complianceReports.reduce((s, r) => s + r.weightedScore, 0) / complianceReports.length) : 85
  };
  res.json({ summary });
});

app.get('/api/compliance/report/:id', authMiddleware, (req, res) => {
  const report = complianceReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'No encontrado' });
  res.json({ report });
});

// ============== EUDR DDS (MVP) ==============
app.post('/api/eudr/due-diligence/:lotId', authMiddleware, (req, res) => {
  const lot = lots.find(l => l.id === req.params.lotId);
  if (!lot) return res.status(404).json({ error: 'Lote no encontrado' });
  const latestReport = complianceReports
    .filter(r => r.lotId === lot.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;

  const geoEvidence = buildGeoEvidence(lot);
  const dds = {
    id: generateId('DDS'),
    lotId: lot.id,
    product: lot.product,
    parcelId: lot.parcel,
    producer: lot.producer,
    operator: req.body?.operator || req.user.username,
    destination: lot.destination,
    createdAt: new Date().toISOString(),
    basedOnComplianceReportId: latestReport?.id || null,
    complianceScore: latestReport?.weightedScore ?? null,
    complianceStatus: latestReport?.status ?? 'PENDING',
    geolocationEvidence: geoEvidence,
    declarations: {
      deforestationFree: geoEvidence.hasCoordinates,
      legalProduction: true,
      dueDiligencePerformed: !!latestReport
    },
    status: geoEvidence.hasCoordinates && (latestReport?.weightedScore ?? 0) >= 80 ? 'READY_FOR_REVIEW' : 'NEEDS_ACTION'
  };
  dds.hash = hashData(dds);
  ddsReports.push(dds);
  if (ddsReports.length > 200) ddsReports = ddsReports.slice(-200);
  saveJSON(files.dds, ddsReports);
  addBlock({ type: 'dds_generated', ddsId: dds.id, lotId: lot.id, ddsHash: dds.hash });
  res.json({ dds });
});

app.get('/api/eudr/due-diligence', authMiddleware, (req, res) => {
  const lotId = req.query.lotId;
  const filtered = lotId ? ddsReports.filter(d => d.lotId === lotId) : ddsReports;
  res.json({ ddsReports: filtered.slice(-50).reverse() });
});

app.get('/api/eudr/due-diligence/:id', authMiddleware, (req, res) => {
  const dds = ddsReports.find(d => d.id === req.params.id);
  if (!dds) return res.status(404).json({ error: 'No encontrado' });
  res.json({ dds });
});

// ============== ALERTS ==============
app.get('/api/alerts', authMiddleware, (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const filtered = unreadOnly ? alerts.filter(a => !a.read) : alerts;
  res.json({ alerts: filtered.slice(-20).reverse(), total: alerts.length, unread: alerts.filter(a => !a.read).length });
});

app.post('/api/alerts/:id/read', authMiddleware, (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) { alert.read = true; saveJSON(files.alerts, alerts); }
  res.json({ success: !!alert });
});

app.post('/api/alerts/read-all', authMiddleware, (req, res) => {
  alerts.forEach(a => a.read = true);
  saveJSON(files.alerts, alerts);
  res.json({ success: true, count: alerts.length });
});

// ============== ADMIN ==============
let systemStats = { apiCalls: 0, blocks: blockchain.length, lastUpdate: new Date().toISOString() };
let systemConfig = { threshold: 70, email: true, timezone: 'America/Lima' };

app.get('/api/admin/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  systemStats.blocks = blockchain.length;
  systemStats.lastUpdate = new Date().toISOString();
  res.json({ stats: systemStats });
});

app.post('/api/admin/config', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  systemConfig = { ...systemConfig, ...req.body };
  res.json({ success: true, config: systemConfig });
});

app.get('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  res.json({ users: users.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role })) });
});

app.delete('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  users.splice(idx, 1);
  saveJSON(files.users, users);
  res.json({ success: true });
});

// ============== DOCUMENT VALIDATION ==============
const validDocumentTypes = ['certificado_origen', 'certificado_calidad', 'certificado_bio', 'factura', 'guia_remision', 'declaracion_aduana'];
const validFormats = ['pdf', 'jpg', 'png', 'jpeg'];

app.post('/api/documents/validate', authMiddleware, (req, res) => {
  const { lotId, documentType, format, fileSize } = req.body;
  
  const errors = [];
  if (!validDocumentTypes.includes(documentType)) errors.push(`Tipo de documento inválido: ${documentType}`);
  if (!validFormats.includes(format?.toLowerCase())) errors.push(`Formato inválido: ${format}`);
  if (!fileSize || fileSize > 10 * 1024 * 1024) errors.push('Tamaño máximo 10MB');
  
  const lot = lots.find(l => l.id === lotId);
  if (!lot) errors.push('Lote no encontrado');
  
  if (errors.length > 0) return res.status(400).json({ valid: false, errors });
  
  addBlock({ type: 'document_validated', lotId, documentType, format, validatedBy: req.user.username });
  res.json({ valid: true, message: 'Documento válido', lot: lot?.id });
});

// ============== EXPORT ==============
app.get('/api/export/compliance/:id', authMiddleware, (req, res) => {
  const report = complianceReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'No encontrado' });
  
  const lot = lots.find(l => l.id === report.lotId);
  const html = generatePDFHTML(report, lot);
  res.json({ html, report, lot });
});

function generatePDFHTML(report, lot) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Compliance - ${report.lotId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #2d3436; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #636e72; font-size: 14px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f8f9fa; }
    .score { font-size: 48px; font-weight: bold; text-align: center; }
    .score.compliant { color: #27ae60; }
    .score.partial { color: #f39c12; }
    .score.non-compliant { color: #e74c3c; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Reporte de Compliance EUDR</h1>
  <div class="header">
    <div>
      <p><strong>Lote:</strong> ${report.lotId}</p>
      <p><strong>Producto:</strong> ${lot?.product || 'N/A'}</p>
      <p><strong>Productor:</strong> ${lot?.producer || 'N/A'}</p>
    </div>
    <div>
      <p><strong>Fecha:</strong> ${new Date(report.timestamp).toLocaleDateString('es-ES')}</p>
      <p><strong>Hora:</strong> ${new Date(report.timestamp).toLocaleTimeString('es-ES')}</p>
    </div>
  </div>
  
  <div class="section" style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 8px;">
    <h2>Score de Compliance</h2>
    <div class="score ${report.status.toLowerCase().replace('_', '-')}">${report.weightedScore}%</div>
    <p><strong>Estado:</strong> ${report.status}</p>
  </div>
  
  <div class="section">
    <h2>Datos del Lote</h2>
    <table>
      <tr><th>Parcela</th><td>${lot?.parcel || 'N/A'}</td></tr>
      <tr><th>Peso</th><td>${lot?.weightKg || 'N/A'} kg</td></tr>
      <tr><th>Destino</th><td>${lot?.destination || 'N/A'}</td></tr>
      <tr><th>Certificación</th><td>${lot?.certification || 'N/A'}</td></tr>
      <tr><th>Estado EUDR</th><td>${lot?.eudr || 'N/A'}</td></tr>
    </table>
  </div>
  
  <div class="section">
    <h2>Verificación de Blockchain</h2>
    <table>
      <tr><th>Hash del Bloque</th><td><code>${report.blockHash || 'N/A'}</code></td></tr>
      <tr><th>Hash del Reporte</th><td><code>${report.hash || 'N/A'}</code></td></tr>
    </table>
  </div>
  
  <div class="footer">
    <p>RWA EUDR - Trazabilidad Agroexportadora</p>
    <p>Generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
  </div>
</body>
</html>`;
}

// ============== TRACES ==============
app.get('/api/traces', (req, res) => {
  res.json({ traces: traceHistory.slice(-20).reverse(), metrics: { total: traceHistory.length } });
});

app.post('/otlp/v1/traces', express.raw({ type: '*/*', limit: '4mb' }), (req, res) => {
  const entry = { id: generateId('TR'), receivedAt: new Date().toISOString(), contentType: req.get('content-type'), rawSize: req.body.length || 0, status: 'received' };
  traceHistory.push(entry);
  if (traceHistory.length > 500) traceHistory.shift();
  saveJSON(files.traces, traceHistory);
  res.status(200).send({ result: 'traces received', traceId: entry.id });
});

// ============== CACHE ==============
app.post('/api/cache/clear', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  cache.clear();
  res.json({ success: true });
});
app.get('/api/cache/status', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos' });
  res.json({ files: fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter(f => f.endsWith('.json')) : [] });
});

// ============== EUDR COPILOTO (preparación documental, no asesoría legal) ==============
app.get('/api/copilot/capabilities', authMiddleware, (req, res) => {
  try {
    res.json(getCapabilities());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/copilot/checklist', authMiddleware, (req, res) => {
  try {
    res.json(getChecklist());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/copilot/gap-analysis', authMiddleware, (req, res) => {
  try {
    const lotId = req.body?.lotId;
    const lot = lots.find((l) => l.id === lotId) || req.body?.lot || {};
    const out = analyzeGaps(lot);
    appendCopilotAudit({
      event: 'gap_analysis',
      user: req.user?.username,
      lotId: lot.id || lotId || null,
      checklistVersion: out.checklistVersion,
      geoPresent: out.signals?.geoPresent
    });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get('/api/copilot/eurlex-refs', authMiddleware, (req, res) => {
  try {
    res.json(getEurlexReferences());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post('/api/copilot/query', authMiddleware, async (req, res) => {
  try {
    const { question, useLlm } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Campo question (string) requerido' });
    }
    const q = question.trim();
    const result = await queryCopilot(q, { useLlm: Boolean(useLlm) });
    appendCopilotAudit({
      event: 'copilot_query',
      user: req.user?.username,
      questionSha256: crypto.createHash('sha256').update(q, 'utf8').digest('hex'),
      questionLen: q.length,
      useLlm: Boolean(useLlm),
      retrievalMode: result.retrievalMode,
      mode: result.mode,
      hybridAvailable: result.hybridAvailable,
      chunkIds: (result.chunksUsed || result.chunks || []).map((c) => c.id).slice(0, 12)
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ============== STATIC ==============
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });

function findAvailablePort(startPort, maxPort = startPort + 20) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      server.close();
      if (err.code === 'EADDRINUSE' && startPort < maxPort) resolve(findAvailablePort(startPort + 1, maxPort));
      else reject(err);
    });
    server.once('listening', () => server.close(() => resolve(startPort)));
    server.listen(startPort, '0.0.0.0');
  });
}

findAvailablePort(port).then((availablePort) => {
  app.listen(availablePort, '0.0.0.0', () => {
    console.log(`\n🚀 RWA EUDR Backend running at http://localhost:${availablePort}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   /api/auth/login    - Login`);
    console.log(`   /api/producers     - CRUD productores`);
    console.log(`   /api/lots         - CRUD lotes`);
    console.log(`   /api/compliance   - Verificación EUDR`);
    console.log(`   /api/alerts       - Alertas`);
    console.log(`   /api/blockchain   - Cadena de bloques`);
    console.log(`   /api/export/*     - Exportar reportes\n`);
    console.log(`🔐 Credenciales:`);
    console.log(`   admin/admin123 (admin)`);
    console.log(`   operador/operador123 (operador)\n`);
  });
}).catch(err => { console.error('Error:', err.message); process.exit(1); });
