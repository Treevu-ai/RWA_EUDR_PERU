# Implementación de APIs Apify - RWA EUDR

## ✅ Mejoras Implementadas

### 1. Scoring Ponderado de Compliance
```javascript
COMPLIANCE_WEIGHTS = {
  euRegulations: 0.40,  // Mayor peso - regulatorio
  weather: 0.20,         // Evidencia climática
  supplyChain: 0.20,    // Riesgos de supply chain
  geolocation: 0.10,     // Georreferenciación
  certifications: 0.10  // Certificaciones
}
```

### 2. Cache con TTL
| Servicio | TTL | Descripción |
|----------|-----|-------------|
| regulations | 1 hora | Regulaciones UE |
| weather | 5 min | Datos climáticos |
| supplyChain | 30 min | Alertas de riesgo |
| marketData | 24 horas | Inteligencia de mercado |
| geolocation | 1 hora | Localizaciones |

### 3. Hash On-Chain para Weather Evidence
```
Weather Data → Hash SHA-256 → Bloque → Blockchain
```
Cada verificación de compliance genera:
- Evidence hash del clima
- Bloque en cadena local
- Trazabilidad inmutable

### 4. Dashboard de Alertas
- Alertas de regulatory, weather, market
- Severidad: high, medium, low
- Marcar como leídas
- Polling automático cada 30s

### 5. Panel de Geolocalización
- Lista de productores georreferenciados
- Coordenadas WGS84
- Estado de georreferenciación

### 6. DDS (MVP actual)
- Generación de DDS por lote
- Evidencia geoespacial base a partir de coordenadas del lote
- Polígono WGS84 aproximado para demo
- Hash de DDS y registro on-chain local

---

## 📡 Endpoints Disponibles

### Datos
- `GET /api/data` - Productores, lotes, stats
- `GET /api/traces` - Historial de trazas OTLP

### Servicios Apify
- `GET /api/services/status` - Estado de todos los servicios
- `GET /api/services/:name` - Ejecutar servicio específico

### Compliance
- `POST /api/compliance/check` - Verificar lote
- `GET /api/compliance/reports` - Historial
- `GET /api/compliance/summary` - Resumen aggregate

### Alertas
- `GET /api/alerts` - Lista de alertas
- `POST /api/alerts/:id/read` - Marcar leída
- `POST /api/alerts/read-all` - Marcar todas leídas

### Blockchain
- `GET /api/blockchain` - Cadena completa
- `GET /api/blockchain/verify` - Verificar integridad

### DDS
- `POST /api/eudr/due-diligence/:lotId` - Generar DDS
- `GET /api/eudr/due-diligence` - Listar DDS
- `GET /api/eudr/due-diligence/:id` - Obtener DDS específica

### Cache
- `POST /api/cache/clear` - Limpiar cache (solo admin)
- `GET /api/cache/status` - Estado del cache (solo admin)

---

## 🚀 Próximos Pasos

### Fase 2: Producción
- [ ] Integrar API key real de Apify
- [ ] Configurar Google Maps API para mapa interactivo
- [ ] Desplegar en Azure App Service
- [ ] Configurar CDN para assets

### Fase 3: Integración Blockchain
- [ ] Conectar con blockchain público (Polygon, Avalanche)
- [ ] Implementar smart contracts para pagos
- [ ] Oráculos para datos climáticos on-chain

### Fase 4: Automatización
- [ ] GitHub Actions para CI/CD
- [ ] Alertas automáticas por email/Slack
- [ ] Dashboard de métricas en Grafana
- [ ] Webhooks para eventos de compliance y DDS

### Fase 5: Escalamiento
- [ ] Agregar más productos (café, quinua, palta)
- [ ] Integrar certificadoras (Rainforest, Fairtrade)
- [ ] API pública para compradores UE

---

## 🔧 Configuración

```bash
# Variables de entorno
APIFY_TOKEN=tu_token_de_apify
PORT=3000
```

Obtener token: https://console.apify.com/account/integrations
