<div align="center">

> ⚠️ **REPOSITORIO PRIVADO Y CONFIDENCIAL**
> Propiedad de **SINAPSIS INNOVADORA S.A.C.** — acceso restringido al equipo interno y colaboradores bajo NDA.
> Ver [`CONFIDENTIAL.md`](CONFIDENTIAL.md) · [`LICENSE`](LICENSE)

<br />

<img src="landing/images/hero-campo.jpg" width="100%" alt="Plantación en laderas — café y terrazas en el contexto de trazabilidad agroexportadora" style="border-radius: 14px; max-height: 320px; object-fit: cover;" />

<br />

[![Landing](https://img.shields.io/badge/Landing-sitio%20comercial-0a5c4a?style=for-the-badge&logo=vercel&logoColor=white)](https://treevu-ai.github.io/RWA_EUDR_PERU/)
[![Docs](https://img.shields.io/badge/Docs-internos-1a6b8c?style=for-the-badge)](https://github.com/Treevu-ai/RWA_EUDR_PERU/tree/main/docs)
[![Prototype](https://img.shields.io/badge/Plataforma-React_+_Express-f59e0b?style=for-the-badge&logo=react&logoColor=white)](https://github.com/Treevu-ai/RWA_EUDR_PERU/tree/main/prototype)
[![License](https://img.shields.io/badge/Licencia-Propietaria-red?style=for-the-badge)](LICENSE)

### Plataforma de trazabilidad, cumplimiento y evidencia agroexportadora

**SINAPSIS INNOVADORA S.A.C.** — expertos en cadenas de valor global y fortalecimiento de cadenas productivas agroexportadoras.

Solución de software para que cooperativas y exportadores peruanos de café, cacao y productos similares construyan **paquetes de evidencia verificables** — origen, cadena de custodia y debida diligencia — con plena trazabilidad ante el mercado europeo (incl. marco EUDR cuando aplique).

<br />

</div>

---

## ¿Qué problema resolvemos?

Las exportaciones agro hacia la UE pierden contratos, sufren stock detenido y erosionan la confianza del comprador cuando la evidencia de origen, custodia y debida diligencia llega tarde, incompleta o sin consistencia. El costo lo absorben productores con baja conectividad y exportadores que improvisan cada envío.

**SINAPSIS INNOVADORA S.A.C.** resuelve esto con una plataforma que orquesta datos de campo, reglas de cumplimiento y paquetes de evidencia exportables desde un único hilo de trazabilidad.

---

## ¿Con qué lo resolvemos?

| Capa | Descripción |
|------|-------------|
| **Captura & custodia** | Registro de fincas, lotes, movimientos y responsables; funciona con señal móvil irregular. |
| **Compliance UE** | Criterios de debida diligencia (DDS MVP), paquetes exportables alineados con el mercado europeo (incl. referencias EUR-Lex). |
| **Auditabilidad** | Trazas OTLP y eventos para reconstruir qué ocurrió en el sistema ante cualquier auditoría. |
| **Copiloto cognitivo** | Recuperación de fragmentos con citas desde corpus versionado; apoyo a preparación documental — no sustituye asesoría legal. |

---

## ¿Cómo lo implementamos?

1. **Diagnóstico**: identificamos producto, mercados UE, sistemas actuales y los puntos de dolor en la evidencia.
2. **Diseño de piloto**: acotamos alcance geográfico, número de lotes, roles internos y métricas de éxito.
3. **Demo guiada** (20–40 min): flujo referencial finca → lote → evidencia geo → compliance → DDS MVP, con datos de laboratorio y copiloto de preparación documental.
4. **Piloto productivo**: una cadena, un producto, una primera integración (CSV / API liviana), con métricas acordadas.

---

## Estado del proyecto

| Área | Estado |
|------|--------|
| **Landing** (`landing/`) | Sitio comercial desplegado; identidad SINAPSIS INNOVADORA S.A.C., mensajería B2B. |
| **Plataforma** (`prototype/`) | Funcional en entorno local: auth, lotes, compliance/DDS MVP, OTLP cliente, blockchain de laboratorio. |
| **Copiloto EUDR** | Corpus + checklist versionados; recuperación léxica e híbrida; modo asistido con LLM opcional. Ver [`docs/eudr-compliance-copilot.md`](docs/eudr-compliance-copilot.md). |
| **Producción / piloto real** | Persistencia JSON de demo; integraciones enterprise y hardening (HTTPS, BD, IAM) se activan bajo acuerdo de piloto. |

---

## Estructura del repositorio

| Ruta | Contenido |
|------|-----------|
| [`docs/`](docs/) | Requisitos UE, propuesta integral, roadmap, pitch, diagramas — uso interno. |
| [`docs/convocatorias/`](docs/convocatorias/) | Checklist, plantillas, pitch 90s, ficha 1 página. |
| [`landing/`](landing/) | Sitio comercial B2C/B2B; [`/clientes/`](landing/clientes/) landing para exportadores y cooperativas. |
| [`prototype/`](prototype/) | Plataforma React + Express: trazas OTLP, compliance preliminar, DDS MVP, copiloto EUDR. |
| [`assets/`](assets/) | Recursos gráficos internos. |

---

## Arranque rápido (entorno de desarrollo)

```bash
# Desde prototype/
npm install
npm start          # API en :3000
npm run dev        # Frontend Vite → http://localhost:5173
```

Credenciales demo: ver [`prototype/README.md`](prototype/README.md).

---

## Despliegue de la landing

El workflow [`.github/workflows/deploy-landing.yml`](.github/workflows/deploy-landing.yml) publica `landing/` en la rama `gh-pages`. En **Settings → Pages**, fuente: rama `gh-pages` / raíz.

> **Nota de privacidad**: la landing incluye `robots.txt` con `Disallow: /` para evitar indexación pública. Verificar que el repositorio esté configurado como **Privado** en GitHub Settings.

---

## Documentación técnica interna

- [`docs/overview.md`](docs/overview.md) — Visión general de la solución.
- [`docs/requirements.md`](docs/requirements.md) — Requisitos de trazabilidad y regulatorios.
- [`docs/propuesta_integral.md`](docs/propuesta_integral.md) — Propuesta blockchain y piloto.
- [`docs/roadmap.md`](docs/roadmap.md) — Fases de desarrollo.
- [`prototype/NEXT_STEPS.md`](prototype/NEXT_STEPS.md) — Próximos pasos técnicos.
- [`docs/demo-runbook.md`](docs/demo-runbook.md) — Runbook demo local (checklist + guión).
- [`docs/eudr-compliance-copilot.md`](docs/eudr-compliance-copilot.md) — Copiloto EUDR (límites, API, corpus).

---

## Aviso legal

El prototipo y el copiloto **no constituyen asesoría jurídica** ni certificación EUDR. La **obligación de cumplimiento** sigue siendo del **operador económico** y de sus asesores cualificados en la UE y en Perú.

---

© 2024–2025 **SINAPSIS INNOVADORA S.A.C.** — Todos los derechos reservados. Ver [`LICENSE`](LICENSE) y [`CONFIDENTIAL.md`](CONFIDENTIAL.md).
