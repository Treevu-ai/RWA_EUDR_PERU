# Prototipo RWA EUDR

Aplicación de demostración para trazabilidad agroexportadora y verificación preliminar de compliance EUDR.

## Stack actual
- `server.js`: backend Express con auth, productores, lotes, compliance, DDS MVP, blockchain local y trazas OTLP.
- `src/`: frontend React montado con Vite.
- `src/tracing.js`: OpenTelemetry web apuntando a `/otlp/v1/traces`.
- `data/*.json`: persistencia local para demo.

## Ejecución recomendada
1. En `prototype/`, instalar dependencias:
   - `npm install`
2. Terminal 1: iniciar backend:
   - `npm start`
3. Terminal 2: iniciar frontend:
   - `npm run dev`
4. Abrir:
   - `http://localhost:5173`

## Build estático
1. `npm install`
2. `npm run build`
3. `npm start`
4. Abrir `http://localhost:3000`

## Credenciales demo
- `admin / admin123`
- `operador / operador123`

## Endpoints principales
- Auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Dashboard: `GET /api/data`, `GET /api/traces`, `GET /api/blockchain`
- Compliance: `POST /api/compliance/check`, `GET /api/compliance/reports`, `GET /api/compliance/summary`
- DDS: `POST /api/eudr/due-diligence/:lotId`, `GET /api/eudr/due-diligence`, `GET /api/eudr/due-diligence/:id`
- Servicios: `GET /api/services/status`, `GET /api/services/:serviceName`
- Admin cache: `POST /api/cache/clear`, `GET /api/cache/status`

## Objetivo
Ofrecer una base funcional para validar flujos de trazabilidad, compliance preliminar y DDS antes de evolucionar hacia un piloto EUDR más formal.
