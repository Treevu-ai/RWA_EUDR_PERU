<div align="center">

> ⚠️ **REPOSITORIO PRIVADO Y CONFIDENCIAL**
> Propiedad de **SINAPSIS INNOVADORA S.A.C.** — acceso restringido al equipo interno y colaboradores bajo NDA.
> Ver [`CONFIDENTIAL.md`](CONFIDENTIAL.md) · [`LICENSE`](LICENSE)

<br />

<img src="landing/images/hero-campo.jpg" width="100%" alt="Plantación en laderas — café y terrazas en el contexto de trazabilidad agroexportadora" style="border-radius: 14px; max-height: 320px; object-fit: cover;" />

<br />

[![Landing](https://img.shields.io/badge/Landing-sitio%20comercial-0a5c4a?style=for-the-badge&logo=vercel&logoColor=white)](https://treevu-ai.github.io/RWA_EUDR_PERU/)
[![License](https://img.shields.io/badge/Licencia-Propietaria-red?style=for-the-badge)](LICENSE)

### Plataforma de trazabilidad, cumplimiento y evidencia agroexportadora

**SINAPSIS INNOVADORA S.A.C.** — expertos en cadenas de valor global y fortalecimiento de cadenas productivas agroexportadoras.

Solución de software para que cooperativas y exportadores peruanos de café, cacao y productos similares construyan **paquetes de evidencia verificables** — origen, cadena de custodia y debida diligencia — con plena trazabilidad ante el mercado europeo (incl. marco EUDR cuando aplique).

**Contacto comercial:** [sinapsisinnovadoraperu@gmail.com](mailto:sinapsisinnovadoraperu@gmail.com) · +51 902 126 765

<br />

</div>

---

## ¿Qué problema resolvemos?

Las exportaciones agro hacia la UE pierden contratos, sufren stock detenido y erosionan la confianza del comprador cuando la evidencia de origen, custodia y debida diligencia llega tarde, incompleta o sin consistencia. El costo lo absorben productores con baja conectividad y exportadores que improvisan cada envío.

**SINAPSIS INNOVADORA S.A.C.** resuelve esto con una plataforma propietaria que orquesta datos de campo, reglas de cumplimiento y paquetes de evidencia exportables desde un único hilo de trazabilidad.

---

## Propuesta de valor

| Capa | Qué obtiene el cliente |
|------|------------------------|
| **Captura & custodia** | Registro de fincas, lotes, movimientos y responsables; funciona con señal móvil irregular. Sin retrabajo en campo. |
| **Compliance UE** | Criterios de debida diligencia (DDS), paquetes exportables alineados con el mercado europeo (incl. referencias EUR-Lex). Menos sorpresas en frontera. |
| **Auditabilidad** | Historial cronológico de cada acción; cualquier auditoría recibe una historia coherente y completa, sin reconstrucciones a último minuto. |
| **Copiloto documental** | Recuperación de fragmentos con citas desde corpus versionado; apoya la preparación documental — no sustituye asesoría legal. |

---

## ¿Cómo avanzamos con un cliente?

1. **Diagnóstico**: identificamos producto, mercados UE, sistemas actuales y los puntos de dolor en la evidencia.
2. **Diseño de piloto**: acotamos alcance geográfico, número de lotes, roles internos y métricas de éxito.
3. **Demo guiada** (20–40 min): flujo referencial finca → lote → evidencia geo → compliance → DDS, con datos de laboratorio y copiloto de preparación documental.
4. **Piloto productivo**: una cadena, un producto, una primera integración (CSV / API liviana), con métricas acordadas.

---

## Estado del proyecto

| Área | Estado |
|------|--------|
| **Landing** (`landing/`) | Sitio comercial desplegado; identidad SINAPSIS INNOVADORA S.A.C., mensajería orientada a exportadores y cooperativas. |
| **Plataforma** (`prototype/`) | Funcional en entorno de demostración: autenticación, lotes, compliance/DDS, historial de auditoría, copiloto. |
| **Copiloto EUDR** | Corpus + checklist versionados; recuperación léxica e híbrida; modo asistido con LLM opcional. Ver [`docs/eudr-compliance-copilot.md`](docs/eudr-compliance-copilot.md). |
| **Producción / piloto real** | Integraciones enterprise y hardening se activan bajo acuerdo de piloto firmado. |

---

## Estructura interna del repositorio

> *Uso exclusivo del equipo SINAPSIS INNOVADORA S.A.C. y colaboradores bajo NDA.*

| Ruta | Contenido |
|------|-----------|
| [`docs/`](docs/) | Requisitos UE, propuesta integral, roadmap, pitch, diagramas — uso interno. |
| [`docs/convocatorias/`](docs/convocatorias/) | Checklist, plantillas, pitch 90s, ficha 1 página. |
| [`landing/`](landing/) | Sitio comercial; [`/clientes/`](landing/clientes/) para exportadores y cooperativas. |
| [`prototype/`](prototype/) | Plataforma React + Express: compliance, DDS, copiloto EUDR. |
| [`assets/`](assets/) | Recursos gráficos internos. |

---

## Entorno de desarrollo (solo uso interno)

> *Esta sección es exclusivamente para el equipo de desarrollo. No compartir con clientes.*

```bash
# Desde prototype/
npm install
npm start          # API en :3000
npm run dev        # Frontend Vite → http://localhost:5173
```

Credenciales demo: ver [`prototype/README.md`](prototype/README.md).

---

## Despliegue de la landing

El workflow [`.github/workflows/deploy-landing.yml`](.github/workflows/deploy-landing.yml) despliega `landing/` en Vercel (producción).

> **Nota de privacidad**: la landing incluye `robots.txt` con `Disallow: /` para evitar indexación pública. Verificar que el repositorio esté configurado como **Privado** en GitHub Settings.

---

## Documentación técnica interna

- [`docs/overview.md`](docs/overview.md) — Visión general de la solución.
- [`docs/requirements.md`](docs/requirements.md) — Requisitos de trazabilidad y regulatorios.
- [`docs/propuesta_integral.md`](docs/propuesta_integral.md) — Propuesta y piloto.
- [`docs/roadmap.md`](docs/roadmap.md) — Fases de desarrollo.
- [`prototype/NEXT_STEPS.md`](prototype/NEXT_STEPS.md) — Próximos pasos técnicos.
- [`docs/demo-runbook.md`](docs/demo-runbook.md) — Runbook demo local (checklist + guión).
- [`docs/eudr-compliance-copilot.md`](docs/eudr-compliance-copilot.md) — Copiloto EUDR (límites, corpus).

---

## Aviso legal

El prototipo y el copiloto **no constituyen asesoría jurídica** ni certificación EUDR. La **obligación de cumplimiento** sigue siendo del **operador económico** y de sus asesores cualificados en la UE y en Perú.

---

© 2024–2025 **SINAPSIS INNOVADORA S.A.C.** — Todos los derechos reservados. Software propietario — prohibida su copia, distribución o uso no autorizado. Ver [`LICENSE`](LICENSE) y [`CONFIDENTIAL.md`](CONFIDENTIAL.md).
