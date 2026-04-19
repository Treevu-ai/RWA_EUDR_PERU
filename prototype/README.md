# Prototipo RWA EUDR

Aplicación de demostración para trazabilidad agroexportadora y verificación preliminar de compliance EUDR.

## Configuración

- Copia [`.env.example`](./.env.example) a `.env` si quieres fijar **`PORT`** (por defecto `3000`).
- El backend aplica **cabeceras HTTP mínimas** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). En producción sitúa **HTTPS** delante (proxy inverso o plataforma) y refuerza políticas allí.

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

## Guión breve de demo (20–40 min)

1. **Login** con `operador` / `operador123`.  
2. **Dashboard / lotes**: elegir un lote con coordenadas válidas para la narrativa.  
3. **Compliance** (y si aplica **DDS**): mostrar flujo referencial y evidencia geo en demo.  
4. **Copiloto EUDR**: pestaña dedicada — checklist vs lote, consulta al corpus con citas, enlaces EUR-Lex; opcional modo asistido si hay `OPENAI_API_KEY`.  
5. **Cierre verbal**: preparación documental y datos ordenados; **no** certificación EUDR ni asesoría legal — responsabilidad del operador económico.

Para una segunda opinión técnica, el evaluador puede clonar el repo y repetir el arranque en dos terminales.

Runbook ampliado (checklist previa, troubleshooting): [`docs/demo-runbook.md`](../docs/demo-runbook.md).

## Copiloto EUDR (preparación documental)

Corpus versionado en `data/eudr-knowledge.json` y checklist en `data/eudr-checklist.json`. Opcional: `OPENAI_API_KEY` para recuperación **híbrida** (embeddings de consulta + léxica) si existe `data/eudr-knowledge.embeddings.json`, y para modo asistido con LLM (`useLlm: true`). Generar el índice: `npm run embed-corpus` (requiere clave). Ver [`docs/eudr-compliance-copilot.md`](../docs/eudr-compliance-copilot.md).

- `GET /api/copilot/capabilities` — versiones, disclaimer, `llmAvailable`, `hybridRetrievalReady`, referencias EUR-Lex.
- `GET /api/copilot/checklist` — checklist completo.
- `GET /api/copilot/eurlex-refs` — lista orientativa de actos CELEX / enlaces plantilla (lectura humana).
- `POST /api/copilot/gap-analysis` — `{ "lotId": "..." }`.
- `POST /api/copilot/query` — `{ "question": "...", "useLlm": false }`.

En la UI: pestaña **Copiloto EUDR** (bloque de enlaces EUR-Lex, checklist vs lote, consulta al corpus).

## Endpoints principales
- Auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Dashboard: `GET /api/data`, `GET /api/traces`, `GET /api/blockchain`
- Compliance: `POST /api/compliance/check`, `GET /api/compliance/reports`, `GET /api/compliance/summary`
- DDS: `POST /api/eudr/due-diligence/:lotId`, `GET /api/eudr/due-diligence`, `GET /api/eudr/due-diligence/:id`
- Servicios: `GET /api/services/status`, `GET /api/services/:serviceName`
- Admin cache: `POST /api/cache/clear`, `GET /api/cache/status`

## Objetivo
Ofrecer una base funcional para validar flujos de trazabilidad, compliance preliminar y DDS antes de evolucionar hacia un piloto EUDR más formal.
