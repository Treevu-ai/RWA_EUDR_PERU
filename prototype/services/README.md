# Integración de APIs Apify - RWA EUDR

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend React                           │
│  (Dashboard | Trazabilidad | Trazas | Inteligencia)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Express                           │
│  /api/data          - Datos de productores y lotes          │
│  /api/traces        - Historial de trazas OTLP             │
│  /api/services/*    - Llamadas a APIs Apify                │
│  /api/compliance/*  - Verificación de compliance EUDR       │
│  /api/market/*      - Inteligencia de mercado              │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Apify APIs   │  │  Mock Data    │  │  Local Cache  │
│  (Production) │  │  (Fallback)   │  │  (JSON)       │
└───────────────┘  └───────────────┘  └───────────────┘
```

## APIs Integradas

### 1. Weather Forecast API
- **Actor**: `taroyamada/weather-forecast-fetcher`
- **Uso**: Registrar condiciones climáticas en finca como evidencia
- **Datos**: Temperatura, humedad, precipitación, pronóstico 7 días
- **Gratuito**: Sí (Open-Meteo API, sin API key)

### 2. Supply Chain Intel
- **Actor**: `fiery_dream/supply-chain-intel`
- **Uso**: Alertas de riesgos, tarifas, disrupciones
- **Datos**: Alertas geopolíticas, climáticas, regulatorias
- **Gratuito**: No (requiere API key)

### 3. EU Compliance (ReguAction)
- **Actor**: `brazen_vanguard/reguaction-ai-compliance-regulation-analyst`
- **Uso**: Convertir regulaciones UE en checklists
- **Datos**: Requisitos, deadlines, controles de compliance
- **Gratuito**: No (usa AI keys propias)

### 4. EU Legal & Procurement API
- **Actor**: `lentic_clockss/sip-eu-legal-procurement-search`
- **Uso**: Búsqueda de regulaciones UE
- **Datos**: EUR-Lex, directivas, regulaciones
- **Gratuito**: Parcial (data sources públicos)

### 5. Google Maps MCP
- **Actor**: `nexgendata/google-maps-mcp-server`
- **Uso**: Geolocalización de fincas y cooperativas
- **Datos**: Coordenadas, direcciones, ratings
- **Gratuito**: Sí (no requiere API key)

### 6. FoodTech Intelligence
- **Actor**: `visita/foodtech-agriculture-intelligence`
- **Uso**: Tendencias AgTech, noticias sectoriales
- **Datos**: Análisis AI de fuentes especializadas
- **Gratuito**: No (usa Brave Search)

### 7. Funding Intel
- **Actor**: `fiery_dream/funding-intel`
- **Uso**: Grants y financiamiento para productores
- **Datos**: Subvenciones, riesgos regulatorios
- **Gratuito**: No (14+ data sources)

## Endpoints

### GET /api/services/status
Lista estado de todos los servicios.

### GET /api/services/:serviceName?lat=X&lon=Y
Ejecuta un servicio específico.

### POST /api/compliance/check
Genera reporte de compliance para un lote.
```json
{
  "lotId": "CAC-2026-001",
  "parcelId": "PAR-045",
  "product": "Cacao",
  "lat": -6.78,
  "lon": -76.03
}
```

### GET /api/market/intelligence
Retorna inteligencia de mercado y regulaciones.

## Configuración

Crear archivo `.env`:
```bash
APIFY_TOKEN=tu_token_aqui
```

Obtener token en: https://console.apify.com/account/integrations

## Fallback Automático

Si no hay API key, los servicios retornan datos simulados (mock) para desarrollo local.

## Próximos Pasos

1. [ ] Conectar Weather API con registro on-chain
2. [ ] Implementar scoring de compliance dinámico
3. [ ] Agregar validación de georreferenciación
4. [ ] Integrar con smart contracts para pagos
5. [ ] Dashboard de alertas en tiempo real
