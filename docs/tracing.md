# Trazabilidad y Tracing en el prototipo

## Propósito
Este documento describe la implementación de tracing en el prototipo visual de la solución blockchain, usando OpenTelemetry Web para capturar interacciones de usuario y tiempos de eventos clave.

## Implementación
- `prototype/src/tracing.js` configura OpenTelemetry Web con un proveedor `WebTracerProvider`.
- Se exportan spans a:
- `POST /otlp/v1/traces` mediante `OTLPTraceExporter`.
  - la consola del navegador con `ConsoleSpanExporter`.
- `prototype/src/App.jsx` usa el tracer para:
  - medir la carga inicial de la aplicación,
  - capturar cambios de panel,
  - trazar llamadas de frontend instrumentadas por `fetch`.

## Cómo usar
1. Desde el directorio `prototype/`, ejecuta `npm install`.
2. Inicia el backend con `npm start`.
3. Inicia el frontend con `npm run dev`.
4. Abre `http://localhost:5173` en el navegador.
5. Interactúa con el prototipo.
5. Revisa las trazas en la consola del backend o en el dashboard de `/api/traces`.

## Qué se captura
- `document.load`: carga inicial del documento.
- `ui.navigate.*`: navegación entre vistas.
- eventos de sesión y carga inicial de la app.
- instrumentación automática de `fetch` y `XMLHttpRequest`.

## Siguientes pasos
- Conectar el colector OTLP a un backend de trazas real.
- Agregar contexto de negocio en los spans (productor, lote, estado EUDR).
- En producción, eliminar el `ConsoleSpanExporter` y usar solo OTLP.
