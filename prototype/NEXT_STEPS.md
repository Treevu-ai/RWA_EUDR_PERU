# Próximos pasos técnicos — prototipo

Orden sugerido para cerrar el salto de “demo local” a “piloto creíble”. Ajustar según socios disponibles.

## Corto plazo (base sólida)

- **Copiloto EUDR**: implementado (corpus `data/eudr-knowledge.json`, checklist `data/eudr-checklist.json`, API y pestaña UI). Opcional: `OPENAI_API_KEY` para modo asistido. Ver `docs/eudr-compliance-copilot.md`.

0. **Entorno**: copiar `prototype/.env.example` → `.env` y documentar puertos antes de exponer públicamente la API.
1. **Persistencia**: salir de JSON de demo solo cuando el piloto lo requiera; definir modelo de datos (lotes, geometrías, custodia) y migración.
2. **Datos de demostración**: revisar si el flujo necesita datos de muestra versionados en repo o generados por script (`prototype/data/` está en `.gitignore` para muchos JSON).
3. **Autenticación**: credenciales demo están bien para laboratorio; documentar rotación y entornos (`dev`/`pilot`) antes de exposición pública.

## Piloto con aliados

4. **Integración mínima**: un solo sistema externo real (por ejemplo exportador ERP liviano o hoja certificada) vía CSV/API acotada.
5. **Geometrías**: validar formato WGS84 y política de precisión con quien audite el piloto.
6. **Paquete DDS/evidencia**: export zip/PDF + hash; alinear etiquetas con lo que el operador debe conservar legalmente.

## Observabilidad y operación

7. **OTLP**: mantener trazas en piloto solo si aportan incident response (evitar coste innecesario).
8. **Seguridad**: HTTPS delante del servidor, límites de tasa en API pública si se expone más allá de localhost. *(Cabeceras mínimas ya aplicadas en `server.js`; endurecer en reverse proxy.)*

## Referencia

- Endpoints actuales: ver `prototype/README.md`.
- Instrumentación frontend: `docs/tracing.md`.
