<div align="center">

> ⚠️ **REPOSITORIO PRIVADO Y CONFIDENCIAL**
> Propiedad de **SINAPSIS INNOVADORA S.A.C.** — acceso restringido al equipo interno y colaboradores bajo NDA.
> Ver [`CONFIDENTIAL.md`](CONFIDENTIAL.md) · [`LICENSE`](LICENSE)

<br />

<img src="landing/images/hero-campo.jpg" width="100%" alt="Plantación en laderas — café y terrazas en el contexto de trazabilidad agroexportadora" style="border-radius: 14px; max-height: 320px; object-fit: cover;" />

<br />

[![Landing](https://img.shields.io/badge/Landing-sitio%20comercial%20(Vercel)-0a5c4a?style=for-the-badge&logo=vercel&logoColor=white)](#despliegue-de-la-landing)
[![License](https://img.shields.io/badge/Licencia-Propietaria-red?style=for-the-badge)](LICENSE)

### Forest Trace AI · Plataforma de trazabilidad, cumplimiento y evidencia agroexportadora

**SINAPSIS INNOVADORA S.A.C.** — expertos en cadenas de valor global y fortalecimiento de cadenas productivas agroexportadoras.

**Forest Trace AI** es el producto de software de **SINAPSIS INNOVADORA S.A.C.** para que cooperativas y exportadores peruanos de café, cacao y productos similares construyan **paquetes de evidencia verificables** — origen, cadena de custodia y debida diligencia (EUDR) — desde un único hilo de trazabilidad frente al mercado europeo.

**Contacto comercial:** [sinapsisinnovadoraperu@gmail.com](mailto:sinapsisinnovadoraperu@gmail.com) · +51 902 126 765

<br />

</div>

> **Monorepo:** El índice principal del repositorio es el [`README.md`](../README.md) en la raíz — describe `landing/`, `prototype/` y esta carpeta.

---

## Accesos rápidos

- **Landing (sitio comercial):** [`landing/`](landing/) · despliegue: [ver sección](#despliegue-de-la-landing)
- **Plataforma (demo):** [`prototype/`](prototype/) · guía técnica: [`prototype/README.md`](prototype/README.md)
- **Docs internas:** [`docs/`](docs/) · overview: [`docs/overview.md`](docs/overview.md)

---

## ¿Qué problema resolvemos?

Las exportaciones agro hacia la UE pierden contratos, sufren stock detenido y erosionan la confianza del comprador cuando la evidencia de origen, custodia y debida diligencia llega tarde, incompleta o inconsistente.

**SINAPSIS INNOVADORA S.A.C.** resuelve esto con una plataforma propietaria que orquesta datos de campo, reglas de cumplimiento y paquetes de evidencia exportables.

---

## Propuesta de valor

| Capa | Qué obtiene el cliente |
|------|------------------------|
| **Captura & custodia** | Registro de fincas, lotes, movimientos y responsables; funciona con señal móvil irregular. Sin retrabajo en campo. |
| **Compliance UE** | Criterios de debida diligencia (DDS), paquetes exportables alineados con el mercado europeo (incl. referencias EUR-Lex). Menos sorpresas en frontera. |
| **Auditabilidad** | Historial cronológico de cada acción; auditoría con una historia coherente y completa, sin reconstrucciones de último minuto. |
| **Copiloto documental** | Recuperación de fragmentos con citas desde un corpus versionado; apoya la preparación documental — no sustituye asesoría legal. |

---

## ¿Cómo avanzamos con un cliente?

1. **Diagnóstico**: identificamos producto, mercados UE, sistemas actuales y los puntos de dolor en la evidencia.
2. **Diseño de piloto**: acotamos alcance geográfico, número de lotes, roles internos y métricas de éxito.
3. **Demo guiada** (20–40 min): flujo referencial finca → lote → evidencia geo → compliance → DDS, con datos de laboratorio y copiloto de preparación documental.
4. **Piloto productivo**: una cadena, un producto, una primera integración (CSV / API liviana), con métricas acordadas.

---

## Diagnóstico inicial y agente asistido

La landing comercial incorpora un embudo de tracción con dos pasos:

1. **Diagnóstico con especialista (24h)**: evaluación inicial de brechas de evidencia y propuesta de alcance.
2. **Pre-auditoría asistida por agente (opcional)**: chequeo de completitud y consistencia para priorizar correcciones antes de auditoría formal.

> **Disclaimer**: la pre-auditoría asistida no constituye certificación ni dictamen legal. La validación final corresponde al operador económico y su asesoría especializada.

---

## Estado del proyecto

| Área | Estado |
|------|--------|
| **Landing** (`landing/`) | Sitio comercial desplegado con branding **Forest Trace AI**, UX optimizada, CTA de diagnóstico y disclaimer legal para agente asistido. |
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
| [`landing/`](landing/) | Sitio comercial único (`/`); `/clientes` redirige en edge (308) a `/` — sin página duplicada. |
| [`prototype/`](prototype/) | Plataforma React + Express: compliance, DDS, copiloto EUDR. |
| [`assets/`](assets/) | Recursos gráficos internos. |

---

## Cómo ejecutar (demo) — `prototype/`

> *Solo para uso interno. No compartir con clientes.*

### Requisitos

- Node.js **20+**
- PostgreSQL **15+** con extensión **PostGIS**

### Configuración

```bash
cd prototype
cp .env.example .env
# Editar DATABASE_URL en .env
npm install
```

### Inicializar base de datos

```bash
npm run db:migrate
npm run db:seed
```

### Ejecutar

```bash
npm start          # API en :3000
npm run dev        # Frontend Vite → http://localhost:5173
```

Más detalle (endpoints/headers): ver [`prototype/README.md`](prototype/README.md).

---

## Despliegue de la landing

El workflow en la raíz del repo [`.github/workflows/deploy-landing.yml`](../.github/workflows/deploy-landing.yml) despliega `landing/` en Vercel (producción). Secrets en GitHub (**Settings → Secrets and variables → Actions**):

- **`VERCEL_TOKEN`** — obligatorio; [crear token](https://vercel.com/account/tokens).
- **`VERCEL_TEAM`** — obligatorio en CI; **slug del equipo** (`vercel.com/<slug>/...`). Sin él el CLI responde `missing_scope` en modo no interactivo.
- **`VERCEL_PROJECT_NAME`** — opcional; nombre del proyecto en el dashboard (por defecto `landing-five-teal-76`). Si el nombre no coincide con tu proyecto, cámbialo aquí.

Si falta el token o el proyecto no coincide con tu cuenta, el workflow falla y el sitio puede seguir mostrando HTML antiguo.

**URL única de producción:** <https://landing-five-teal-76-eta.vercel.app/> (`/clientes` → `/` vía [`landing/vercel.json`](landing/vercel.json)). Si aún ves contenido viejo en otro subdominio `.vercel.app`, suele ser otro proyecto en el mismo equipo: en [Settings → Domains](https://vercel.com/docs/projects/domains) asigna el dominio deseado solo al proyecto que despliega este repo y elimina o despublica el duplicado.

> **Nota de privacidad**: la landing incluye `robots.txt` con `Disallow: /` para evitar indexación pública. Verificar que el repositorio esté configurado como **Privado** en GitHub Settings.

---

## Despliegue del prototype

El workflow [`.github/workflows/deploy-prototype.yml`](.github/workflows/deploy-prototype.yml) despliega `prototype/` en Vercel (producción). Usa los mismos secrets de Actions:

- **`VERCEL_TOKEN`** — token del equipo en Vercel.
- **`VERCEL_TEAM`** — slug del equipo (`vercel.com/<slug>/...`).
- **`VERCEL_PROJECT_NAME`** — opcional; si el dominio productivo sigue apuntando a un proyecto legado (por ejemplo, el que servía `prototype-rosy-two.vercel.app`), configúralo con ese nombre para relinkear el deploy al proyecto correcto.

El endpoint `GET /api/health` responde `200` tanto en modo normal como degradado, indicando si la base está `reachable`, `unreachable` o `unconfigured`. Esto evita falsos negativos en despliegues serverless donde el backend público debe seguir respondiendo aunque `DATABASE_URL` aún no esté configurado.

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

El prototipo y el copiloto **no constituyen asesoría jurídica** ni certificación EUDR. La **obligación de cumplimiento** sigue siendo del **operador económico** y de sus asesores calificados.

---

© 2024–2026 **SINAPSIS INNOVADORA S.A.C.** — Todos los derechos reservados. Software propietario — prohibida su copia, distribución o uso no autorizado. Ver [`LICENSE`](LICENSE) y [`CONFIDENTIAL.md`](CONFIDENTIAL.md).
