# Normativa Peruana para el Cumplimiento EUDR

> Documento de referencia para el piloto Forest Trace AI.
> Mapea entidades publicas peruanas y sus normas relevantes frente a los 8 ambitos de legalidad del Art. 2.40 EUDR.
> Ver [`../prototype/data/peru-regulatory.json`](../prototype/data/peru-regulatory.json) para la version estructurada (ingesta RAG).

---

## 1. Mapa de entidades peruanas vs. ambitos EUDR

| Entidad | Ambitos EUDR que cubre | Rol en el piloto |
|---------|----------------------|------------------|
| **MIDAGRI** | (a) Tenencia, (b) Ambiente | Identidad del productor, Padron de Productores, geolocalizacion |
| **SERFOR** | (a) Uso de suelo, (b) Ambiente, (c) FPIC | Clasificacion bosque vs. uso agrario, planes de manejo forestal |
| **SENASA** | (h) Comercio y aduanas | Certificacion fitosanitaria de exportacion |
| **MINAM** | (b) Ambiente, (e) DDHH | Evaluacion ambiental, areas protegidas, GeoBosques |
| **SUNARP** | (a) Tenencia de tierra | Titulos de propiedad registrados |
| **SUNAT** | (f) Tributario, (h) Aduanas | RUC, declaraciones de exportacion (DUA) |
| **MINCETUR** | (h) Comercio | Acuerdo comercial Peru-UE, politica de comercio exterior |
| **PROMPERU** | -- (guia, no fiscalizador) | Manuales de cumplimiento EUDR para exportadores |
| **Gobiernos Regionales** | (a) Catastro, (b) Autorizaciones | Catastro rural (San Martin, Cajamarca) |

---

## 2. MIDAGRI — Ministerio de Desarrollo Agrario y Riego

### Rol frente al EUDR
MIDAGRI es la entidad rectora del agro peruano. Su **Padron de Productores Agrarios (PPA)** y la iniciativa de **Identidad Digital del Productor** son los pilares nacionales para la trazabilidad que exige el EUDR.

### Normas clave

- **Padron de Productores Agrarios (PPA)** — Registro oficial con geolocalizacion. Solo ~100K de ~2M de productores registrados. La brecha de 1.9M es el mayor riesgo de exclusion del mercado UE.
- **Identidad Digital del Productor** — Proyecto MIDAGRI para asignar identidad unica a cada productor. Alineado con requisito EUDR Art. 9.
- **AgroDigital** — Plataforma de interoperabilidad de datos agropecuarios. Potencial integracion con Forest Trace via API.
- **Ley 31075** — Ley de Organizaciones Agrarias. Marco legal de cooperativas cafetaleras y cacaoteras.
- **DS 002-2016-MINAGRI** — Politica Nacional Agraria.

### Checkpoint para el piloto
- [ ] Verificar si la cooperativa del piloto esta en el Padron MIDAGRI
- [ ] Validar que los productores participantes tienen parcelas geolocalizadas en el PPA
- [ ] Evaluar integracion con AgroDigital para sincronizacion de datos de productores

---

## 3. SERFOR — Servicio Nacional Forestal y de Fauna Silvestre

### Rol frente al EUDR
SERFOR es la autoridad forestal nacional. Su clasificacion de uso de suelo es **determinante** para el cumplimiento EUDR: define si una parcela es bosque, plantacion o sistema agroforestal.

### Punto critico para Peru
Los sistemas agroforestales de cafe y cacao bajo sombra **NO son bosque** bajo la definicion FAO incorporada en el EUDR Art. 2(6) y confirmada por el OJ C/2025/4524 Cap. 4(d). Esto significa que:

- Una parcela de cafe bajo sombra en San Martin **no perdio bosque** si siempre fue sistema agroforestal
- La evidencia de SERFOR (plan de manejo, clasificacion de uso) es la prueba documental clave
- El argumento tecnico debe documentarse con DS 020-2015-MINAGRI (Reglamento de Plantaciones y Sistemas Agroforestales)

### Normas clave

- **Ley 29763** — Ley Forestal y de Fauna Silvestre. Define bosque, plantacion y uso agrario.
- **DS 018-2015-MINAGRI** — Reglamento de Gestion Forestal.
- **DS 020-2015-MINAGRI** — Reglamento de Plantaciones y Sistemas Agroforestales. **Norma mas relevante para cafe/cacao.**
- **GeoBosques** — Plataforma de monitoreo oficial (con MINAM). Alertas de perdida de bosque.

### Checkpoint para el piloto
- [ ] Obtener clasificacion SERFOR de cada parcela del piloto
- [ ] Si es sistema agroforestal, documentar con DS 020-2015 y definicion FAO
- [ ] Validar con GeoBosques que no hubo perdida de bosque post-2020 en las parcelas

---

## 4. SENASA — Servicio Nacional de Sanidad Agraria

### Normas clave
- **Ley 27322** — Ley de Sanidad Agraria.
- **Certificado Fitosanitario de Exportacion** — Documento obligatorio para exportar a la UE. Evidencia ambito (h) EUDR.
- **Registro de Exportadores SENASA** — Identificacion oficial del exportador peruano.

### Checkpoint para el piloto
- [ ] Verificar que el exportador esta registrado en SENASA
- [ ] Obtener modelo de Certificado Fitosanitario para incluir en paquete DDS

---

## 5. MINAM — Ministerio del Ambiente

### Normas clave
- **Ley 27446** — Ley del SEIA. Certificacion ambiental para proyectos agroindustriales.
- **Ley 26834** — Ley de Areas Naturales Protegidas. Verificar que la parcela no esta en ANP.
- **GeoBosques** — Alertas oficiales de deforestacion. Fuente primaria para validacion satelital.

---

## 6. SUNARP — Registros Publicos

### Nota tecnica para Peru
En zonas rurales de San Martin y Cajamarca, muchos productores tienen **certificados de posesion** (no titulos de propiedad formalizados). La UE acepta documentacion de tenencia segun la legislacion del pais de produccion. El certificado de posesion emitido por COFOPRI o el Gobierno Regional es evidencia valida si la legislacion peruana lo reconoce.

### Normas clave
- **Ley 26366** — Ley del Sistema Nacional de Registros Publicos.
- **Consulta de Propiedad en Linea** — Servicio SUNARP de verificacion de titularidad.

### Checkpoint para el piloto
- [ ] Para cada productor: titulo SUNARP o certificado de posesion?
- [ ] Si es certificado de posesion, documentar sustento legal peruano que lo valida.

---

## 7. SUNAT — Aduanas y Tributacion

### Normas clave
- **DL 1053** — Ley General de Aduanas. Regimen de exportacion definitiva.
- **RUC activo y habido** — Evidencia de cumplimiento tributario (ambito f).
- **Declaracion Unica de Aduanas (DUA)** — Documento de exportacion.

### Checkpoint para el piloto
- [ ] Verificar RUC activo del exportador y de la cooperativa
- [ ] Documentar el proceso de DUA como parte del flujo de trazabilidad
- [ ] Incluir codigo SA correcto (0901 para cafe, 1801-1806 para cacao)

---

## 8. MINCETUR y PROMPERU

- **Acuerdo Comercial Multipartes Peru-UE** (vigente desde 2013) — Marco de cooperacion regulatoria.
- **Guia PROMPERU de Cumplimiento EUDR** — Manual practico para exportadores peruanos.

---

## 9. Flujo de verificacion Peru a UE

```
FINCA (San Martin / Cajamarca)
  |
  +-- 1. MIDAGRI: Identidad digital + padron + geolocalizacion
  +-- 2. SERFOR: Clasificacion de uso (agrario / sistema agroforestal)
  +-- 3. SUNARP: Titulo de propiedad o certificado de posesion
  +-- 4. MINAM / GeoBosques: Historial satelital post-2020
  |
ACOPIO / COOPERATIVA
  |
  +-- 5. Trazabilidad de cadena de custodia
  |
EXPORTACION
  |
  +-- 6. SENASA: Certificado Fitosanitario de Exportacion
  +-- 7. SUNAT: RUC activo + DUA de exportacion
  +-- 8. DDS EUDR: Paquete de evidencia consolidado
  |
MERCADO UE OK
```

---

## 10. Referencias rapidas

| Entidad | Portal |
|---------|--------|
| MIDAGRI | https://www.gob.pe/midagri |
| SERFOR | https://www.gob.pe/serfor |
| SENASA | https://www.gob.pe/senasa |
| MINAM | https://www.gob.pe/minam |
| SUNARP | https://www.gob.pe/sunarp |
| SUNAT | https://www.gob.pe/sunat |
| PROMPERU | https://www.gob.pe/promperu |
| GeoBosques | https://geobosques.minam.gob.pe/ |

---

> **Aviso**: Este documento es una guia de orientacion para el piloto Forest Trace AI. No sustituye la verificacion de cada norma en el diario oficial El Peruano ni la consulta con las entidades mencionadas. La obligacion de cumplimiento legal corresponde al operador economico.
