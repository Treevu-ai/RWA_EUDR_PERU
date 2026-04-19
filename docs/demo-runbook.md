# Runbook — demo técnica (prototipo local)

Guía para repetir la misma sesión ante un cliente o evaluador. No sustituye contrato ni alcance de piloto.

## Antes de la reunión

- Repo clonado; `prototype/` con `npm install` ejecutado al menos una vez.
- Dos terminales disponibles (API + Vite) o bien `npm run build` + `npm start` en uno solo (`http://localhost:3000`).
- Navegador limpio o ventana anónima para evitar sesiones cruzadas.
- (Opcional) `.env` en `prototype/` con `OPENAI_API_KEY` si quieres copiloto **asistido** y/o recuperación **híbrida** tras `npm run embed-corpus`.
- Frase de cierre preparada: *preparación documental y orden de evidencias; la obligación legal sigue siendo del operador económico.*

## Arranque (referencia rápida)

Desde la carpeta `prototype/`:

```bash
npm install   # si hace falta
```

Terminal A:

```bash
npm start
```

Terminal B:

```bash
npm run dev
```

Abrir **[http://localhost:5173](http://localhost:5173)** (proxy al API según configuración Vite habitual del proyecto).

Credenciales demo: `**operador` / `operador123`** (o `admin` / `admin123` si necesitas funciones admin).

## Guión sugerido (~20–40 min)


| Orden | Qué mostrar             | Mensaje clave                                                                                              |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1     | Login como operador     | Datos locales de laboratorio; no es producción.                                                            |
| 2     | Lotes / dashboard       | Elegir un **lote con coordenadas** si la narrativa es geo/EUDR.                                            |
| 3     | Compliance              | Verificación preliminar como **referencia**, no certificación oficial.                                     |
| 4     | DDS MVP (si hay tiempo) | Paquete de evidencia DDS en demo; mismo matiz de límites.                                                  |
| 5     | **Copiloto EUDR**       | Checklist vs lote → consulta al corpus → fragmentos citados → bloque EUR-Lex. Opcional LLM solo con clave. |
| 6     | Cierre                  | Transparencia del código abierto; siguiente paso = **piloto acotado** con métricas acordadas.              |


Detalle extendido del paso Copiloto: `[docs/eudr-compliance-copilot.md](eudr-compliance-copilot.md)`.

## Si algo falla


| Síntoma              | Comprobación                                                         |
| -------------------- | -------------------------------------------------------------------- |
| 401 / sesión         | Volver a login; token en sesión del navegador.                       |
| Puerto ocupado       | Variable `PORT` en `.env` o cerrar proceso previo.                   |
| Copiloto solo léxico | Normal sin índice de embeddings o sin API key para consulta híbrida. |
| Modo asistido gris   | Falta `OPENAI_API_KEY` en el proceso del servidor.                   |


## Lecturas para el evaluador

- `[prototype/README.md](../prototype/README.md)` — stack, endpoints, guión breve duplicado.
- `[docs/tracing.md](tracing.md)` — OTLP en cliente (opcional en demo).

## Landing pública

- Vista general: [sitio GitHub Pages](https://treevu-ai.github.io/RWA_EUDR_PERU/) — sección **Demo** enlaza al repositorio.
- B2B: [landing clientes](https://treevu-ai.github.io/RWA_EUDR_PERU/clientes/).

