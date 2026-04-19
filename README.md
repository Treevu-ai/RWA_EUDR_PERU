<div align="center">

<img src="landing/images/hero-campo.jpg" width="100%" alt="Plantación en laderas — café y terrazas en el contexto de trazabilidad agroexportadora" style="border-radius: 14px; max-height: 320px; object-fit: cover;" />

<sub>Imagen de referencia para uso del proyecto (material divulgativo).</sub>

<br />

[![GitHub Pages](https://img.shields.io/badge/Pages-sitio%20informativo-0a5c4a?style=for-the-badge&logo=github&logoColor=white)](https://treevu-ai.github.io/RWA_EUDR_PERU/)
[![Repo](https://img.shields.io/badge/Código-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Treevu-ai/RWA_EUDR_PERU)
[![Docs](https://img.shields.io/badge/Markdown-docs-1a6b8c?style=for-the-badge)](https://github.com/Treevu-ai/RWA_EUDR_PERU/tree/main/docs)
[![Prototype](https://img.shields.io/badge/React_+_Express-prototype-f59e0b?style=for-the-badge&logo=react&logoColor=white)](https://github.com/Treevu-ai/RWA_EUDR_PERU/tree/main/prototype)

### Evidencia de origen · Cadena de custodia · Debida diligencia frente a la UE

*Documentación abierta y prototipo para orquestar trazabilidad en cadenas agroexportadoras peruanas — con foco inicial en café y cacao y en exigencias del mercado europeo (incl. marco EUDR cuando aplique).*

[![Para empresas](https://img.shields.io/badge/Landing-para%20clientes%20B2B-0d9488?style=flat-square)](https://treevu-ai.github.io/RWA_EUDR_PERU/clientes/)

<br />

</div>

---

## Por qué existe este repositorio

Las importaciones sensibles hacia la UE requieren **documentación verificable**, **geometrías coherentes** y **trazabilidad demostrable**. Sin una capa común de datos y gobernanza, el costo lo pagan productores con baja conectividad y exportadores que arriesgan continuidad comercial.

Este proyecto **documenta requisitos**, **propone arquitectura** y ofrece un **prototipo funcional** para validar flujos antes de escalar integraciones.

---

## Qué encontrarás aquí

| Ruta | Contenido |
|------|-----------|
| **`assets/`** | Recursos para documentación en GitHub (p. ej. banner del README) |
| [**`docs/`**](docs/) | Requisitos UE, propuesta integral, roadmap, pitch, diagramas |
| [**`docs/convocatorias/`**](docs/convocatorias/) | Checklist, plantillas, pitch 90s, ficha 1 página, exportación a PDF |
| [**`landing/`**](landing/) | Sitio estático; [**`/clientes/`**](landing/clientes/) landing B2B para exportadores y cooperativas |
| [**`prototype/`**](prototype/) | Demo React + Express: trazas OTLP, compliance preliminar, DDS MVP |

---

## Objetivos

- Documentar requisitos regulatorios y de sostenibilidad de la UE aplicables a productos agroexportadores peruanos.
- Diseñar una solución que permita captura de origen, verificación ambiental, evidencia de trazabilidad y — donde aporte valor — anclaje de evidencia en cadena.
- Apoyar a productores, cooperativas, logística y exportadores con **paquetes de información** repetibles.

---

## Arranque rápido

**Sitio público** → [treevu-ai.github.io/RWA_EUDR_PERU](https://treevu-ai.github.io/RWA_EUDR_PERU/)

**Prototipo local** (desde `prototype/`):

```bash
npm install
npm start          # API en un terminal
npm run dev        # frontend Vite en otro → http://localhost:5173
```

Credenciales demo: ver [`prototype/README.md`](prototype/README.md).

---

## Publicación de la landing

El workflow [`.github/workflows/deploy-landing.yml`](.github/workflows/deploy-landing.yml) publica `landing/` en la rama `gh-pages`. En **Settings → Pages**, fuente: rama **`gh-pages`** / raíz.

---

## Documentación clave

- [`docs/overview.md`](docs/overview.md) — Visión general de la solución.
- [`docs/requirements.md`](docs/requirements.md) — Requisitos de trazabilidad y regulatorios.
- [`docs/propuesta_integral.md`](docs/propuesta_integral.md) — Propuesta blockchain y piloto.
- [`docs/roadmap.md`](docs/roadmap.md) — Fases de desarrollo.
- [`prototype/NEXT_STEPS.md`](prototype/NEXT_STEPS.md) — Próximos pasos técnicos sugeridos.
- [`docs/eudr-compliance-copilot.md`](docs/eudr-compliance-copilot.md) — Copiloto EUDR (preparación documental, límites, API).

---

## Aviso

El contenido es **divulgativo y técnico**; no sustituye asesoría legal ni las obligaciones del operador económico ante la normativa aplicable en la UE y en Perú.
