# Visión General de la Solución

## Propósito

Construir una solución integral que facilite el cumplimiento de los requisitos de la Unión Europea para las importaciones de productos agroexportadores peruanos, con un enfoque en café y cacao.

## Componentes principales

1. Registro de origen y trazabilidad
   - Identificación de fincas y productores.
   - Seguimiento de lotes desde la finca hasta la exportación.
   - Datos de transporte y almacenamiento.
   - Aprovechamiento del conocimiento y la evidencia compartida por actores usando blockchain.

2. Gestión de cumplimiento normativo
   - Control de permisos, certificaciones y documentación requerida.
   - Revisión automática de requisitos según el destino de exportación.
   - Alertas de incumplimiento y gestión de excepciones.

3. Control ambiental y de sostenibilidad
   - Validación de prácticas ambientales y sociales.
   - Registro de datos de uso de insumos, agroquímicos y agua.
   - Indicadores de sostenibilidad claves para auditorías.

4. Reportes y auditoría
   - Generación de reportes de trazabilidad.
   - Exportación de datos en formatos exigidos por la UE.
   - Soporte para auditorías internas y externas.

5. Capa de **copiloto / apoyo cognitivo** (prototipo; opcional)
   - Recuperación de fragmentos **con citas** desde un corpus versionado (léxica; **híbrida** con embeddings si se genera el índice y hay clave de API).
   - Modo **asistido** con LLM solo si se configura en servidor; las respuestas deben anclarse a fragmentos `[id]` — no sustituye asesoría legal ni declara cumplimiento EUDR.
   - Checklist de preparación frente al lote en demo, enlaces de lectura a EUR-Lex y registro ligero de uso para trazabilidad del proceso interno.
   - **No** es un agente autónomo que actúe en nombre del operador económico; el juicio y la responsabilidad siguen siendo humanos.

## Tecnologías recomendadas

- Backend: Node.js, Python o .NET para APIs y lógica de negocio.
- Base de datos: SQL o NoSQL según los requerimientos de trazabilidad.
- Interfaz: Web app para gestión de datos y dashboards.
- Integraciones: sistemas de certificación, IoT/agricultura y plataformas logísticas.

## Beneficios esperados

- Reducción de riesgos de rechazo en frontera.
- Mejora en la transparencia de la cadena de suministro.
- Mayor confianza de compradores europeos.
- Apoyo a la sostenibilidad y a la trazabilidad de origen.

## Documentación relacionada

- `docs/propuesta_integral.md` - Propuesta integral blockchain y plan piloto detallado.
- `prototype/README.md` - Prototipo y arranque local.
- `docs/eudr-compliance-copilot.md` - Copiloto EUDR: límites, API y modo asistido opcional.
