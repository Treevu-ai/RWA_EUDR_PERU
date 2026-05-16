# Diagrama de Arquitectura de la Soluciรณn Blockchain

Este documento presenta la arquitectura propuesta para la soluciรณn hรญbrida blockchain orientada a cadenas agroexportadoras peruanas.

```mermaid
flowchart LR
  Prod[Productores / Fincas] -->|Registro y geolocalizaciรณn| Mobile[App mรณvil offline-first]
  Mobile -->|Sincroniza| Integracion[Plataforma de integraciรณn]
  Integracion --> APIGateway[API Gateway]
  APIGateway --> DB[Data Lake / Almacenamiento off-chain]
  APIGateway --> BC[Blockchain permissioned]
  APIGateway --> Rules[Motor de reglas EUDR]
  BC --> Nodes[Nodos consorciados: MIDAGRI, cooperativas, certificadores, exportadores]
  BC --> SC[Smart contracts de trazabilidad y pago]
  Rules --> Reports[Reportes / DDS]
  DB --> Portal[Portal y dashboards]
  Portal --> Auditores[Auditores / Compradores]
  Reports --> Auditores
```

## Componentes clave

- **App mรณvil offline-first**: captura de datos en campo, georreferenciaciรณn, sincronizaciรณn diferida.
- **Plataforma de integraciรณn**: orquesta datos, valida formatos y conecta con MIDAGRI/AgroDigital.
- **API Gateway**: expone servicios a portales, aplicaciones y sistemas externos.
- **Almacenamiento off-chain**: documentos, imágenes, evidencia satelital, datos de IoT.
- **Blockchain permissioned**: registro inmutable de hashes, eventos de trazabilidad y smart contracts.
- **Motor de reglas EUDR**: valida cumplimiento de requisitos regulatorios y genera DDS.
- **Portal y dashboards**: visualización para cooperativas, exportadores, auditores y compradores.
- **Nodos consorciados**: aseguran gobernanza y validación compartida de la red.
