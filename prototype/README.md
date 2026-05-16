# ForestTrace Prototype - Sprint 1

Base ejecutable del plan de integracion: API Node + PostgreSQL/PostGIS con multi-tenant basico, entidades core y auditoria.

## Requisitos

- Node.js 20+
- PostgreSQL 15+ con extension PostGIS

## Configuracion

1. Copiar `.env.example` a `.env`
2. Ajustar `DATABASE_URL`
3. Instalar dependencias:

```bash
npm install
```

## Inicializacion de base de datos

```bash
npm run db:migrate
npm run db:seed
```

## Ejecutar API

```bash
npm start
```

Servidor: `http://localhost:3000`

## Endpoints disponibles (Sprint 1)

- `GET /api/health`
- `GET /api/producers`
- `POST /api/producers`
- `GET /api/farms`
- `POST /api/farms`
- `GET /api/lots`
- `POST /api/lots`
- `PUT /api/lots/:id/link-farm`
- `POST /api/ingestion/excel`
- `POST /api/ingestion/geojson`
- `POST /api/compliance/check`
- `GET /api/compliance/reports`
- `GET /api/compliance/summary`
- `POST /api/reports/compliance/:complianceRecordId`
- `GET /api/reports/:reportId/download`
- `POST /api/reports/:reportId/share`
- `GET /api/reports/shared/:token`
- `POST /api/finance/lots/:lotId/simulate`
- `GET /api/export/lots.csv`
- `GET /api/docs`
- `GET /api/metrics`

### Headers requeridos

- `x-org-id`: UUID de organizacion
- `x-actor-id` (opcional): UUID de usuario actor para auditoria

## Entregables Sprint 1 cubiertos

- Esquema DB core con PostGIS (`src/db/schema.sql`)
- Repos DB para `producers` y `batches`
- `audit_events` para acciones create
- Plantilla de ingesta CSV en `templates/excel/`

## Entregables Sprint 2 cubiertos (ingesta y geoespacial base)

- Ingesta de CSV por endpoint (`/api/ingestion/excel`) con validacion de plantilla
- Ingesta GeoJSON Polygon (`/api/ingestion/geojson`) con validacion de geometria WGS84
- Gestion de `farms` y vinculacion lote-parcela (`/api/lots/:id/link-farm`)
- Auditoria de eventos de importacion y vinculacion

## Entregables Sprint 3 cubiertos (scoring defendible v1)

- Evaluacion de riesgo v1: NDVI 50%, ubicacion 30%, calidad de datos 20%
- Persistencia de `assessment_runs` y `compliance_records`
- Endpoints de reportes y resumen por organizacion
- Respuesta con desglose de contribuciones por factor

## Entregables Sprint 4 cubiertos (PDF + share link)

- Generacion PDF de compliance con `pdfkit`
- Descarga directa de reporte por ID
- Share link temporal con token y expiracion

## Entregables Sprint 5 cubiertos (comercial + API minima)

- Simulacion financiera por lote (`value_estimated`, `financing_eligible`)
- Export consolidado CSV para operaciones/comercial
- Endpoint de documentacion API minima enterprise

## Entregables Sprint 6 cubiertos (hardening + observabilidad + tests)

- Control de permisos por rol (`viewer`, `operator`, `admin`) en endpoints criticos de escritura
- Request ID por peticion y endpoint de metricas (`/api/metrics`)
- Suite minima de contratos API en `test/api-contract.test.js`
