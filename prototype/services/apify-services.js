import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const APIFY_BASE = 'https://api.apify.com/v2';

export const COMPLIANCE_WEIGHTS = {
  euRegulations: 0.40,
  weather: 0.20,
  supplyChain: 0.20,
  geolocation: 0.10,
  certifications: 0.10
};

export const CACHE_TTL = {
  regulations: 60 * 60 * 1000,
  weather: 5 * 60 * 1000,
  supplyChain: 30 * 60 * 1000,
  marketData: 24 * 60 * 60 * 1000,
  geolocation: 60 * 60 * 1000
};

export function hashData(data, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(JSON.stringify(data)).digest('hex').substring(0, 16);
}

export function generateBlockHash(blockData) {
  const { index, timestamp, data, previousHash } = blockData;
  const blockString = `${index}${timestamp}${JSON.stringify(data)}${previousHash}`;
  return hashData(blockString);
}

export class CacheManager {
  constructor(cacheDir = dataDir) {
    this.cacheDir = cacheDir;
    this.memoryCache = new Map();
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  get(key) {
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
      return memEntry.data;
    }

    const filePath = path.join(this.cacheDir, `${key}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Date.now() - cached.timestamp < cached.ttl) {
          this.memoryCache.set(key, cached);
          return cached.data;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  set(key, data, ttl = 60000) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    this.memoryCache.set(key, entry);

    const filePath = path.join(this.cacheDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
  }

  invalidate(key) {
    this.memoryCache.delete(key);
    const filePath = path.join(this.cacheDir, `${key}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clear() {
    this.memoryCache.clear();
    const files = fs.readdirSync(this.cacheDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    });
  }
}

export const cache = new CacheManager();

async function apifyActor(actorId, runInput) {
  if (!APIFY_TOKEN) {
    return { error: 'APIFY_TOKEN no configurado', fallback: true, data: generateMockData(actorId, runInput) };
  }

  try {
    const response = await fetch(`${APIFY_BASE}/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...runInput, memoryMbytes: 512 })
    });

    const run = await response.json();
    
    if (!run.data || !run.data.id) {
      console.log(`Apify actor ${actorId}: Response error`, run);
      return { error: 'Actor no disponible o token inválido', fallback: true, data: generateMockData(actorId, runInput) };
    }
    
    const runId = run.data.id;

    let status = 'RUNNING';
    const maxWait = 60000;
    const startTime = Date.now();

    while (status === 'RUNNING' || status === 'READY') {
      if (Date.now() - startTime > maxWait) {
        return { error: 'Timeout esperando actor', runId };
      }
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`${APIFY_BASE}/acts/${actorId}/runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
      });
      const statusData = await statusRes.json();
      status = statusData.data?.status || 'RUNNING';
      if (status === 'SUCCEEDED') break;
    }

    const datasetRes = await fetch(`${APIFY_BASE}/acts/${actorId}/runs/${runId}/dataset/items`, {
      headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` }
    });

    const data = await datasetRes.json();
    return { success: true, data, runId, hash: hashData(runId) };
  } catch (err) {
    console.log(`Apify actor ${actorId} error:`, err.message);
    return { error: err.message, fallback: true, data: generateMockData(actorId, runInput) };
  }
}

function generateMockData(actorId, input = {}) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const mocks = {
    'weather': {
      type: 'weather_data',
      location: { lat: input.lat || -6.78, lon: input.lon || -76.03, name: input.location || 'San Martín, Perú' },
      current: {
        temp: 22 + Math.floor(Math.random() * 6),
        humidity: 70 + Math.floor(Math.random() * 20),
        conditions: ['Soleado', 'Parcialmente nublado', 'Nublado'][Math.floor(Math.random() * 3)],
        rainfall: Math.floor(Math.random() * 15),
        windSpeed: 5 + Math.floor(Math.random() * 10),
        uvIndex: 6 + Math.floor(Math.random() * 5)
      },
      forecast: [
        { date: dateStr, max: 28, min: 18, rain: Math.floor(Math.random() * 20), conditions: 'Parcial' },
        { date: new Date(now.getTime() + 86400000).toISOString().split('T')[0], max: 27, min: 17, rain: Math.floor(Math.random() * 15), conditions: 'Soleado' },
        { date: new Date(now.getTime() + 172800000).toISOString().split('T')[0], max: 26, min: 16, rain: Math.floor(Math.random() * 25), conditions: 'Lluvia ligera' }
      ],
      historical: {
        last7Days: {
          totalRainfall: 25 + Math.floor(Math.random() * 30),
          avgTemp: 23,
          avgHumidity: 75
        }
      },
      source: 'Open-Meteo',
      timestamp: now.toISOString(),
      hash: hashData({ type: 'weather', timestamp: now.getTime() })
    },
    'supply-chain': {
      type: 'supply_chain_intel',
      timestamp: now.toISOString(),
      alerts: [
        { id: 'ALR-001', type: 'regulatory', severity: 'high', region: 'UE', message: 'EUDR: Nuevos requisitos de georreferenciación entrarán en vigencia 2025', action: 'Verificar parcelas' },
        { id: 'ALR-002', type: 'weather', severity: 'medium', region: 'Perú', message: 'Pronóstico de lluvias intensas en zona norte (7-10 días)', action: 'Monitorear cosecha' },
        { id: 'ALR-003', type: 'market', severity: 'low', region: 'Global', message: 'Precio cacao alcanza máximo histórico en mercados UE', action: 'Evaluar时机' }
      ],
      risks: [
        { name: 'Congestión portuaria', location: 'Puerto Callao', level: 'low', probability: 0.2, trend: 'stable' },
        { name: 'Restricciones UEDR', location: 'UE', level: 'medium', probability: 0.6, trend: 'increasing' },
        { name: 'Clima - El Niño', location: 'Costa Norte Perú', level: 'medium', probability: 0.4, trend: 'uncertain' }
      ],
      logistics: {
        transitTimeDays: 25,
        portCongestion: 'low',
        capacityAvailable: true
      },
      hash: hashData({ type: 'supply', timestamp: now.getTime() })
    },
    'eu-compliance': {
      type: 'compliance_check',
      timestamp: now.toISOString(),
      regulation: 'EUDR',
      status: 'active',
      requirements: [
        { id: 'EUDR-001', category: 'geolocation', title: 'Georreferenciación obligatoria', priority: 1, status: 'required', deadline: '2025-01-01', penalty: 'Rechazo de lote', verified: false },
        { id: 'EUDR-002', category: 'certification', title: 'Certificación orgánica UE', priority: 1, status: 'required', deadline: '2025-01-01', penalty: 'Multa + rechazo', verified: false },
        { id: 'EUDR-003', category: 'deforestation', title: 'Declaración deforestación cero', priority: 1, status: 'required', deadline: '2025-01-01', penalty: 'Rechazo entrada UE', verified: false },
        { id: 'EUDR-004', category: 'due-diligence', title: 'Due Diligence obligatorio', priority: 2, status: 'required', deadline: '2025-01-01', penalty: 'Multa administrativa', verified: false },
        { id: 'EUDR-005', category: 'traceability', title: 'Trazabilidad hasta finca', priority: 1, status: 'required', deadline: '2025-01-01', penalty: 'Rechazo lote', verified: false }
      ],
      controls: [
        { requirement: 'EUDR-001', control: 'Polígonos de parcela con coordenadas WGS84', frequency: 'Por lote', evidence: 'Archivo GeoJSON' },
        { requirement: 'EUDR-002', control: 'Certificado USDA Organic o similar UE', frequency: 'Anual', evidence: 'PDF certificado' },
        { requirement: 'EUDR-003', control: 'Declaración jurada + evidencia satelital', frequency: 'Por lote', evidence: 'Imagen satelital' }
      ],
      complianceScore: 0,
      hash: hashData({ type: 'compliance', timestamp: now.getTime() })
    },
    'eu-regulations': {
      type: 'regulations_search',
      timestamp: now.toISOString(),
      results: [
        {
          id: 'REG-001',
          title: 'Reglamento (UE) 2023/1115 - EUDR',
          description: 'Reglamento sobre productos libres de deforestación',
          source: 'EUR-Lex',
          url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R1115',
          relevance: 0.98,
          keyPoints: [
            'Prohibición de productos derivados de tierras deforestadas post-2020',
            'Obligación de due diligence para operadores',
            'Requisitos de georreferenciación obligatorios'
          ],
          effectiveDate: '2024-12-30'
        },
        {
          id: 'REG-002',
          title: 'Reglamento Delegado (UE) 2023/2774',
          description: 'Criterios técnicos para productos sin deforestación',
          source: 'EUR-Lex',
          url: 'https://eur-lex.europa.eu',
          relevance: 0.92,
          keyPoints: [
            'Definición técnica de "deforestación" y "degradación forestal"',
            'Estándares de verificación satelital',
            'Metodología de evaluación de riesgo'
          ],
          effectiveDate: '2024-12-30'
        }
      ],
      hash: hashData({ type: 'regulations', timestamp: now.getTime() })
    },
    'geolocation': {
      type: 'geolocation_data',
      timestamp: now.toISOString(),
      locations: input.search ?
        [
          { name: 'Finca Los Andes', lat: -6.4852, lon: -76.3671, type: 'farm', address: 'San Martín, Perú', verified: true, area: '4.5 ha', status: 'active' },
          { name: 'Cooperativa APROCAM', lat: -6.5217, lon: -76.3823, type: 'cooperative', address: 'San Martín, Perú', verified: true, members: 180, status: 'active' }
        ] : [],
      geofencing: {
        enabled: true,
        alerts: ['entry', 'exit']
      },
      hash: hashData({ type: 'geo', timestamp: now.getTime() })
    },
    'market': {
      type: 'market_intelligence',
      timestamp: now.toISOString(),
      regulations: {
        eu: {
          name: 'EU Deforestation Regulation (EUDR)',
          status: 'active',
          deadline: '2025-01-01',
          enforcement: 'Strict',
          keyRequirements: [
            'Georreferenciación de parcelas (polígonos)',
            'Certificación de origen',
            'Due Diligence obligatorio',
            'Trazabilidad hasta finca'
          ]
        },
        peru: {
          name: 'Estrategia Nacional anti-deforestación',
          status: 'in_progress',
          alignment: 'Compatible con EUDR'
        }
      },
      marketData: {
        cacao: {
          globalDemand: 'Creciendo',
          euImports: '34% del total',
          trend: 'up',
          priceEURperKg: 9.50,
          premiumOrganic: '+15-25%',
          topMarkets: ['Países Bajos', 'Bélgica', 'Alemania']
        },
        cafe: {
          globalDemand: 'Estable',
          euImports: '25% del total',
          trend: 'stable',
          priceEURperKg: 8.20,
          premiumOrganic: '+10-20%',
          topMarkets: ['Alemania', 'Italia', 'Francia']
        }
      },
      opportunities: [
        { type: 'premium_price', market: 'UE', premium: '15-25%', requirement: 'Certificación orgánica + Fairtrade', roi: 0.25 },
        { type: 'carbon_credits', market: 'EU ETS', potential: 'Alto', requirement: 'Verificación terceros', roi: 0.15 }
      ],
      hash: hashData({ type: 'market', timestamp: now.getTime() })
    }
  };

  for (const key of Object.keys(mocks)) {
    if (actorId.includes(key)) {
      return mocks[key];
    }
  }
  return mocks['market'];
}

export const apifyServices = {
  weather: {
    name: 'Weather Forecast API',
    actorId: 'taroyamada/weather-forecast-fetcher',
    description: 'Datos climáticos para evidencia de trazabilidad',
    cacheKey: 'weather',
    cacheTTL: CACHE_TTL.weather,
    async fetch({ lat, lon, location }) {
      const cacheKey = `weather_${lat}_${lon}`;
      const cached = cache.get(cacheKey);
      if (cached) return { ...cached, cached: true };

      const result = await apifyActor(this.actorId, {
        location: location || `${lat},${lon}`,
        forecastDays: 7
      });

      if (result.success || result.fallback) {
        cache.set(cacheKey, result.data, this.cacheTTL);
      }
      return result;
    }
  },

  supplyChain: {
    name: 'Supply Chain Intel',
    actorId: 'fiery_dream/supply-chain-intel',
    description: 'Monitoreo de riesgos y alertas de supply chain',
    cacheKey: 'supply_chain',
    cacheTTL: CACHE_TTL.supplyChain,
    async fetch({ region = 'Latinoamérica' }) {
      const cached = cache.get(this.cacheKey);
      if (cached) return { ...cached, cached: true };

      const result = await apifyActor(this.actorId, { region, alerts: true });

      if (result.success || result.fallback) {
        cache.set(this.cacheKey, result.data, this.cacheTTL);
      }
      return result;
    }
  },

  euCompliance: {
    name: 'EUDR Compliance Checker',
    actorId: 'brazen_vanguard/reguaction-ai-compliance-regulation-analyst',
    description: 'Análisis de cumplimiento normativo EUDR',
    cacheKey: 'eudr_compliance',
    cacheTTL: CACHE_TTL.regulations,
    async fetch({ url, regulation = 'EUDR' }) {
      const cached = cache.get(this.cacheKey);
      if (cached) return { ...cached, cached: true };

      const result = await apifyActor(this.actorId, {
        url: url || 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023R1115',
        regulation
      });

      if (result.success || result.fallback) {
        cache.set(this.cacheKey, result.data, this.cacheTTL);
      }
      return result;
    }
  },

  euRegulations: {
    name: 'EU Legal Search',
    actorId: 'lentic_clockss/sip-eu-legal-procurement-search',
    description: 'Búsqueda de regulaciones UE',
    cacheKey: 'eu_regulations',
    cacheTTL: CACHE_TTL.regulations,
    async fetch({ query = 'deforestation cacao coffee', sources = ['EUR-Lex', 'TED'] }) {
      const cacheKey = `regulations_${query}`;
      const cached = cache.get(cacheKey);
      if (cached) return { ...cached, cached: true };

      const result = await apifyActor(this.actorId, { query, sources });

      if (result.success || result.fallback) {
        cache.set(cacheKey, result.data, this.cacheTTL);
      }
      return result;
    }
  },

  geolocation: {
    name: 'Google Maps MCP',
    actorId: 'nexgendata/google-maps-mcp-server',
    description: 'Geolocalización de fincas y cooperativas',
    cacheKey: 'geolocation',
    cacheTTL: CACHE_TTL.geolocation,
    async fetch({ search, location }) {
      const cacheKey = `geo_${search}_${location}`;
      const cached = cache.get(cacheKey);
      if (cached) return { ...cached, cached: true };

      const result = await apifyActor(this.actorId, {
        search: search || 'cooperativa café cacao',
        location: location || 'Perú'
      });

      if (result.success || result.fallback) {
        cache.set(cacheKey, result.data, this.cacheTTL);
      }
      return result;
    }
  },

  marketIntelligence: {
    name: 'Market Intelligence',
    description: 'Inteligencia de mercado y regulaciones',
    cacheKey: 'market_intel',
    cacheTTL: CACHE_TTL.marketData,
    async fetch() {
      const cached = cache.get(this.cacheKey);
      if (cached) return { data: cached, cached: true };

      const regulations = await apifyServices.euRegulations.fetch({ query: 'EUDR cacao coffee' });
      const marketData = generateMockData('market');

      const data = {
        ...marketData,
        regulations: regulations.data || {}
      };

      cache.set(this.cacheKey, data, this.cacheTTL);
      return { data };
    }
  },

  funding: {
    name: 'Funding Intel',
    actorId: 'fiery_dream/funding-intel',
    description: 'Grants y financiamiento para productores',
    async fetch({ sector = 'agriculture', region = 'Peru' }) {
      return apifyActor(this.actorId, { sector, region, grants: true });
    }
  },

  documents: {
    name: 'Doc To Markdown',
    actorId: 'abotapi/doc-to-markdown-mcp',
    description: 'Conversión de PDFs a Markdown',
    async fetch({ url }) {
      return apifyActor(this.actorId, { url });
    }
  }
};

export async function getServiceStatus() {
  const status = {};
  for (const [key, service] of Object.entries(apifyServices)) {
    status[key] = {
      name: service.name,
      configured: !!APIFY_TOKEN,
      description: service.description,
      actorId: service.actorId || 'internal',
      cacheTTL: service.cacheTTL ? `${service.cacheTTL / 1000}s` : 'N/A'
    };
  }
  return status;
}

export async function executeService(serviceName, params = {}) {
  const service = apifyServices[serviceName];
  if (!service) {
    return { error: `Servicio '${serviceName}' no encontrado` };
  }
  return service.fetch(params);
}

export function calculateWeightedComplianceScore(checks, weights = COMPLIANCE_WEIGHTS) {
  let totalScore = 0;
  let totalWeight = 0;

  const checkMap = {
    euRegulations: checks[0],
    weather: checks[1],
    supplyChain: checks[2],
    geolocation: checks[3]
  };

  for (const [key, check] of Object.entries(checkMap)) {
    if (check.status === 'fulfilled' && !check.value.error) {
      const weight = weights[key] || 0;
      let checkScore = 0;

      const data = check.value.data;
      if (data) {
        if (key === 'euRegulations' && data.requirements) {
          const total = data.requirements.length;
          const verified = data.requirements.filter(r => r.verified || r.status === 'verified').length;
          checkScore = total > 0 ? (verified / total) * 100 : 50;
        } else if (key === 'weather') {
          checkScore = 100;
        } else if (key === 'supplyChain') {
          const highAlerts = (data.alerts || []).filter(a => a.severity === 'high').length;
          checkScore = Math.max(0, 100 - (highAlerts * 30));
        } else if (key === 'geolocation') {
          const verified = (data.locations || []).filter(l => l.verified).length;
          const total = (data.locations || []).length;
          checkScore = total > 0 ? (verified / total) * 100 : 50;
        }
      }

      totalScore += checkScore * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

export function determineComplianceStatus(score) {
  if (score >= 80) return 'COMPLIANT';
  if (score >= 50) return 'PARTIAL';
  return 'NON_COMPLIANT';
}

export function generateEvidenceHash(type, data, timestamp) {
  const blockData = {
    type,
    data,
    timestamp: timestamp || new Date().toISOString(),
    nonce: Math.floor(Math.random() * 1000000)
  };
  return hashData(blockData);
}

export { apifyActor };
