# Copiloto de preparación documental EUDR

## Propósito

Herramienta de **apoyo a la organización de evidencias** y **recuperación de fragmentos internos** con **citas explícitas** (`source_citation`). Refuerza la propuesta de valor del prototipo sin presentarse como **asesoría jurídica**.

## Límites (producto y responsabilidad)

- La **responsabilidad frente al Reglamento (UE) 2023/1115** y la normativa aplicable sigue siendo del **operador económico** y de sus asesores cualificados.
- Los fragmentos en `prototype/data/eudr-knowledge.json` son **orientativos**; la fuente vinculante es el **texto oficial en EUR-Lex** y los actos publicados en el DOUE.
- El modo **recuperación** no usa modelo generativo: solo empareja palabras con el corpus versionado.
- El modo **asistido** (opcional) usa un LLM **solo si** existe `OPENAI_API_KEY` en el servidor; el sistema prompt obliga a citar fragmentos `[id]` y a no declarar cumplimiento legal.

## Archivos clave

| Ruta | Contenido |
|------|-----------|
| `prototype/data/eudr-knowledge.json` | Corpus versionado de fragmentos con citas |
| `prototype/data/eudr-checklist.json` | Lista de preparación (revisión humana) |
| `prototype/services/eudr-copilot.js` | Lógica: búsqueda, huecos, consulta opcional LLM |

## API (autenticación igual que el resto del prototipo)

- `GET /api/copilot/capabilities` — versiones, `llmAvailable`, disclaimer.
- `GET /api/copilot/checklist` — checklist completo.
- `POST /api/copilot/gap-analysis` — cuerpo `{ "lotId": "..." }` usa el lote cargado en servidor; señal automática mínima para coordenadas en demo.
- `POST /api/copilot/query` — cuerpo `{ "question": "...", "useLlm": false }`.

## Evolución recomendada

- Sustituir recuperación léxica por **embeddings** y citas con ventana de contexto ampliada.
- Ingesta asistida de **EUR-Lex** con versionado y hash del documento fuente.
- Registro de **auditoría** por consulta en entornos regulados.
