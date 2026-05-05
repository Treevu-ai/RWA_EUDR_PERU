# TODO — Mitigación de Riesgos RWA_EUDR (Seguimiento)

## Fase 1: Entorno
- [x] Crear `.env.example`

## Fase 2: Persistencia SQLite
- [x] Integrar `db.js` en `server.js`
- [x] Migrar datos demo con script de seed en PostgreSQL (`npm run db:seed`)
- [x] Reemplazar lectura/escritura JSON por queries SQL en endpoints core (`/api/producers`, `/api/lots`)
- [x] Definir esquema base multi-tenant + auditoría (`src/db/schema.sql`)

## Fase 3: Seguridad
- [x] Agregar `dotenv` al inicio de `server.js`
- [x] Agregar `helmet` middleware
- [ ] Agregar `express-rate-limit`
- [ ] Reemplazar `hashData` por `bcrypt` en passwords
- [ ] Implementar JWT (reemplazar sesiones en memoria)
- [ ] Agregar validación `zod` en endpoints críticos

## Fase 4: Testing
- [ ] Verificar inicio del servidor
- [ ] Probar login con bcrypt + JWT
- [ ] Confirmar copiloto y blockchain operativos

## Fase 5: Sprint 2 (Ingesta + Geo)
- [x] Endpoint de ingesta CSV/Excel con validacion de plantilla
- [x] Endpoint de ingesta GeoJSON con validacion geometrica
- [x] CRUD basico de parcelas (`farms`)
- [x] Vinculacion lote-parcela + evento de auditoria

## Fase 6: Sprint 3 (Scoring + Assessment Runs)
- [x] Motor de scoring v1 con desglose por factor
- [x] Persistencia de `assessment_runs` y `compliance_records`
- [x] Endpoints `/api/compliance/check`, `/reports`, `/summary`

## Fase 7: Sprint 4 (Reportes PDF + Share)
- [x] Generacion de PDF de compliance
- [x] Endpoint de descarga de PDF
- [x] Share link temporal con token y expiracion

## Fase 8: Sprint 5 (Comercial + API Enterprise Minima)
- [x] Simulacion financiera por lote (`eligible financing`)
- [x] Export CSV consolidado de lotes
- [x] Endpoint de documentacion API minima (`/api/docs`)

## Fase 9: Sprint 6 (Hardening + Observabilidad + Contratos)
- [x] Roles de acceso en endpoints de escritura
- [x] Request ID y metricas basicas de API
- [x] Pruebas de contrato API criticas

