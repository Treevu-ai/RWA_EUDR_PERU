/**
 * RWA EUDR — punto de entrada del servidor.
 * Responsabilidad: configurar Express, montar middlewares globales y rutas.
 * Toda la lógica de negocio y el estado viven en lib/ y routes/.
 */
import express from 'express';
import path from 'path';
import net from 'net';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

import { validateEnv } from './lib/env.js';
import { systemStats } from './lib/db.js';

import authRoutes       from './routes/auth.js';
import producerRoutes   from './routes/producers.js';
import lotRoutes        from './routes/lots.js';
import complianceRoutes from './routes/compliance.js';
import ddsRoutes        from './routes/dds.js';
import alertRoutes      from './routes/alerts.js';
import blockchainRoutes from './routes/blockchain.js';
import adminRoutes      from './routes/admin.js';
import userRoutes       from './routes/users.js';
import documentRoutes   from './routes/documents.js';
import exportRoutes     from './routes/export.js';
import traceRoutes      from './routes/traces.js';
import copilotRoutes    from './routes/copilot.js';
import dataRoutes       from './routes/data.js';
import cacheRoutes      from './routes/cache.js';

validateEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

// ── Cabeceras de seguridad mínimas ───────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Same-origin requests (SPA servida por Express) no envían Origin.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// ── Body parsing & stats ─────────────────────────────────────────────────────
app.use(express.json({ limit: '4mb' }));
app.use((_req, _res, next) => { systemStats.apiCalls++; next(); });

// ── Rate limiting global para /api/ ─────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intente más tarde.' }
});
app.use('/api/', apiLimiter);

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/producers',       producerRoutes);
app.use('/api/lots',            lotRoutes);
app.use('/api/compliance',      complianceRoutes);
app.use('/api/eudr',            ddsRoutes);
app.use('/api/alerts',          alertRoutes);
app.use('/api/blockchain',      blockchainRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/users',           userRoutes);
app.use('/api/documents',       documentRoutes);
app.use('/api/export',          exportRoutes);
app.use('/api/copilot',         copilotRoutes);
app.use('/api/cache',           cacheRoutes);
app.use('/api',                  dataRoutes);        // /api/data, /api/services/*
app.use('/',                    traceRoutes);       // /api/traces, /otlp/v1/traces

// ── Static (Vite build) ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

// ── Arranque con búsqueda de puerto libre ────────────────────────────────────
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
    console.log(`🔐 Credenciales demo: ver README (no se imprimen en log para evitar exposición en entornos de producción).`);
    console.log(`🔧 Características activas:`);
    console.log(`   CORS origins        : ${allowedOrigins.join(', ')}`);
    console.log(`   Sesión TTL          : ${process.env.SESSION_TTL_HOURS || 8}h`);
    console.log(`   Rate limiting       : activo (API: 200/min · Auth: 20/15min · Copilot: 20/min)`);
    if (process.env.OPENAI_API_KEY) {
      console.log(`   OpenAI              : activo (modelo: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`);
    } else {
      console.log(`   OpenAI              : desactivado — copiloto solo léxico (falta OPENAI_API_KEY)`);
    }
    if (process.env.APIFY_TOKEN) {
      console.log(`   Apify               : activo`);
    } else {
      console.log(`   Apify               : desactivado — usando datos simulados (falta APIFY_TOKEN)`);
    }
    console.log('');
  });
}).catch((err) => { console.error('Error:', err.message); process.exit(1); });
