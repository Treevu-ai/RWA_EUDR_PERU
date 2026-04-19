# Copiloto de preparación documental EUDR

## Propósito

Herramienta de **apoyo a la organización de evidencias** y **recuperación de fragmentos internos** con **citas explícitas** (`source_citation`). Refuerza la propuesta de valor del prototipo sin presentarse como **asesoría jurídica**.

En términos de producto, es **apoyo cognitivo acotado** (recuperación sobre corpus propio + redacción asistida opcional), **no** un sistema de agentes autónomos que sustituya al operador económico ni que “certifique” EUDR.

## Límites (producto y responsabilidad)

- La **responsabilidad frente al Reglamento (UE) 2023/1115** y la normativa aplicable sigue siendo del **operador económico** y de sus asesores cualificados.
- Los fragmentos en `prototype/data/eudr-knowledge.json` son **orientativos**; la fuente vinculante es el **texto oficial en EUR-Lex** y los actos publicados en el DOUE.
- El modo **recuperación léxica** empareja palabras con el corpus versionado.
- Si existe un índice `prototype/data/eudr-knowledge.embeddings.json` y **`OPENAI_API_KEY`** en el servidor, la consulta puede usar modo **híbrido**: embedding de la pregunta + puntuación léxica fusionada en un solo ranking.
- El modo **asistido** (opcional) usa un LLM **solo si** existe `OPENAI_API_KEY`; el sistema prompt obliga a citar fragmentos `[id]` y a no declarar cumplimiento legal.

## Archivos clave

| Ruta | Contenido |
|------|-----------|
| `prototype/data/eudr-knowledge.json` | Corpus versionado de fragmentos con citas |
| `prototype/data/eudr-checklist.json` | Lista de preparación (revisión humana) |
| `prototype/data/eurlex-references.json` | Referencias CELEX / plantillas EUR-Lex (consulta humana) |
| `prototype/data/eudr-knowledge.embeddings.json` | Índice de embeddings (generado; ver abajo) |
| `prototype/data/copilot-audit.jsonl` | Log append-only de uso (no incluir secretos ni texto literal de preguntas) |
| `prototype/scripts/build-embeddings.mjs` | Genera el archivo de embeddings desde el corpus |
| `prototype/services/eudr-copilot.js` | Recuperación híbrida, huecos, consulta opcional LLM |

### Generar embeddings del corpus

Desde `prototype/`:

```bash
npm run embed-corpus
```

Requiere `OPENAI_API_KEY`. Modelo por defecto: `text-embedding-3-small` (`OPENAI_EMBEDDING_MODEL` opcional).

En el prototipo, la pestaña **Copiloto EUDR** muestra las referencias de `eurlex-references.json` con enlaces (lectura humana junto al corpus).

## API (autenticación igual que el resto del prototipo)

- `GET /api/copilot/capabilities` — versiones, disclaimer, `llmAvailable`, `embeddingIndexPresent`, `hybridRetrievalReady`, `eurlexRefsVersion`.
- `GET /api/copilot/checklist` — checklist completo.
- `GET /api/copilot/eurlex-refs` — datos de `eurlex-references.json`.
- `POST /api/copilot/gap-analysis` — cuerpo `{ "lotId": "..." }` usa el lote cargado en servidor; señal automática mínima para coordenadas en demo.
- `POST /api/copilot/query` — cuerpo `{ "question": "...", "useLlm": false }`. La respuesta incluye `retrievalMode` (`lexical` \| `hybrid`), `chunks` con `lexicalScore` / `cosineScore` cuando aplique.

## Auditoría

Cada `gap-analysis` y cada `query` registra una línea JSON en `prototype/data/copilot-audit.jsonl` (usuario demo, tipo de evento, modo de recuperación). Las preguntas se registran solo como **hash SHA-256** y longitud, no texto en claro.

## Evolución recomendada

- Ingesta versionada de extractos EUR-Lex con hash del documento fuente ampliado.
- Políticas de retención y firma para `copilot-audit.jsonl` en entornos regulados.
