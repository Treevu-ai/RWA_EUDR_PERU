# Solución de Cumplimiento Normativo y Trazabilidad para Exportaciones Agropecuarias Peruanas

Este proyecto busca documentar y desarrollar una solución que facilite el cumplimiento de estándares normativos, ambientales y de trazabilidad requeridos por la Unión Europea para las importaciones de productos como café, cacao y otras mercancías del top de la canasta agroexportadora peruana.

## Objetivos del Proyecto

- Documentar los requisitos regulatorios y de sostenibilidad de la UE aplicables a los productos agroexportadores peruanos.
- Diseñar una solución tecnológica que permita: 
  - captura de datos de origen y cadena de suministro,
  - verificación de cumplimiento ambiental,
  - generación de evidencia de trazabilidad,
  - identificación y aprovechamiento del conocimiento desarrollado por actores del sector,
  - integración de blockchain como fuente confiable de trazabilidad y evidencia.
- Crear una plataforma que apoye a productores, cooperativas, operadores logísticos y exportadores.

## Alcance inicial

- Productos foco: café y cacao, con extensión a otros productos clave de la canasta agroexportadora.
- Cobertura: trazabilidad de la finca hasta la exportación, cumplimiento de normas de sostenibilidad y requisitos de documentación para la UE.
- Componentes propuestos:
  - Registro de origen y cadena de custodia.
  - Control documental de certificaciones y permisos.
  - Validación de criterios ambientales y sociales.
  - Panel de seguimiento y generación de reportes de cumplimiento.

## Estructura del Proyecto

- `docs/` - Documentación de requisitos, diseño y roadmap.
- `landing/` - Landing informativa estática (HTML/CSS) sobre la iniciativa y cooperación UE.
- `src/` - Código de la solución (aplicación, APIs, integraciones).
- `data/` - Ejemplos de datos, esquemas y casos de prueba.

## Primeros pasos

1. Recopilar los requisitos normativos UE aplicables a café, cacao y otros productos.
2. Definir los flujos de datos para trazabilidad y las entidades clave.
3. Diseñar la arquitectura de la solución (módulos, APIs, almacenamiento, integraciones).
4. Implementar prototipos de captura de datos y reportes de cumplimiento.

## Documentación clave

- `docs/overview.md` - Visión general de la solución y componentes.
- `docs/requirements.md` - Requisitos regulatorios y de trazabilidad.
- `docs/propuesta_integral.md` - Propuesta integral blockchain y plan piloto detallado.
- `docs/roadmap.md` - Fases de desarrollo y prioridades.
- `docs/tracing.md` - Documentación de tracing e instrumentación.
- `prototype/README.md` - Prototipo React con backend local y panel de trazas.
- `prototype/server.js` - Backend Express con datos de muestra y receptor OTLP.
