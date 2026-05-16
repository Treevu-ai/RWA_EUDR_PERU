import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cómo funciona Forest Trace AI — Flujo de cumplimiento EUDR',
  description: 'Guía completa del Sistema de Diligencia Debida EUDR automatizado. Desde la geolocalización de la parcela hasta la DDS exportable en PDF. 5 factores de scoring, 8 ámbitos de legalidad, copiloto documental.',
}

export default function ComoFunciona() {
  return (
    <main className="min-h-screen bg-background text-foreground font-mono px-6 py-16 lg:px-24 max-w-3xl mx-auto">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4"><Link href="/" className="hover:text-foreground">← Forest Trace AI</Link></p>
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight uppercase mb-6">Cómo funciona Forest Trace AI</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-12">Una guía completa del flujo de cumplimiento EUDR automatizado. Desde que el productor registra su parcela hasta que el exportador presenta la Declaración de Debida Diligencia ante el mercado europeo.</p>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">1. Registro de productor y geolocalización</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">El proceso comienza con el registro del productor en la plataforma. Se capturan los datos básicos: nombre, cooperativa, tipo de cultivo (café o cacao), y región de producción. A continuación, se registra cada parcela con sus coordenadas WGS84.</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Para parcelas menores a 4 hectáreas se requiere un punto central (latitud y longitud). Para parcelas de 4 hectáreas o más se requiere el polígono completo en formato GeoJSON. La plataforma valida automáticamente que las coordenadas no se solapen con zonas residenciales, cuerpos de agua o áreas naturales protegidas.</p>
        <p className="text-sm text-muted-foreground leading-relaxed">Los datos se cruzan con el Padrón de Productores Agrarios de MIDAGRI y con la clasificación de uso de suelo de SERFOR para determinar si la parcela es bosque, plantación o sistema agroforestal.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">2. Scoring de riesgo — Modelo v1.1</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Cada lote pasa por un motor de scoring que evalúa 5 factores ponderados:</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground leading-relaxed mb-3 space-y-1">
          <li><strong>NDVI (40%)</strong>: cambio en el índice de vegetación detectado por análisis satelital post-2020.</li>
          <li><strong>Ubicación (20%)</strong>: proximidad a frentes de deforestación activa y zonas de riesgo.</li>
          <li><strong>Calidad de datos (20%)</strong>: completitud de la información geoespacial y documental.</li>
          <li><strong>Complejidad de cadena (10%)</strong>: número de intermediarios, transformadores y países de tránsito.</li>
          <li><strong>Índice de corrupción (10%)</strong>: basado en el CPI de Transparencia Internacional del país/región.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">El score resultante se clasifica en 4 niveles alineados al concepto de «riesgo despreciable» del Art. 2.26 EUDR:</p>
        <ul className="list-disc pl-5 text-sm leading-relaxed mb-3 space-y-1">
          <li className="text-[#ea580c]"><strong>NEGLIGIBLE</strong> (&lt;0.15): sin preocupación razonable de incumplimiento.</li>
          <li className="text-muted-foreground"><strong>LOW</strong> (0.15-0.35): preocupaciones menores, resolubles con documentación.</li>
          <li className="text-muted-foreground"><strong>MODERATE</strong> (0.35-0.60): requiere medidas de mitigación obligatorias (Art. 11 EUDR).</li>
          <li className="text-muted-foreground"><strong>HIGH</strong> (≥0.60): el producto no puede introducirse en el mercado UE sin reducción de riesgo.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">3. Verificación de los 8 ámbitos de legalidad</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">El Artículo 2.40 del EUDR exige verificar el cumplimiento de la legislación del país de producción en 8 ámbitos. La plataforma rastrea cada uno con estados verificables:</p>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground leading-relaxed space-y-2 mb-3">
          <li><strong>Derechos de uso del suelo y tenencia</strong>: títulos SUNARP, certificados de posesión, contratos de arrendamiento.</li>
          <li><strong>Protección del medio ambiente</strong>: permisos SERFOR, certificaciones ambientales MINAM.</li>
          <li><strong>Derechos de terceros (FPIC/CLPI)</strong>: consulta previa a comunidades indígenas si aplica.</li>
          <li><strong>Legislación laboral</strong>: contratos, seguridad social, prohibición de trabajo infantil.</li>
          <li><strong>Derechos humanos</strong>: evidencia de no violación de DDHH en la zona de producción.</li>
          <li><strong>Normativa tributaria</strong>: RUC activo, declaraciones SUNAT al día.</li>
          <li><strong>Legislación anticorrupción</strong>: políticas internas, debida diligencia de contrapartes.</li>
          <li><strong>Normativa comercial y aduanera</strong>: certificado fitosanitario SENASA, DUA de exportación, código SA correcto.</li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed">Cada ámbito pasa por los estados: <span className="text-foreground">pending → evidence_collected → verified → flagged</span>. La plataforma asigna automáticamente una fecha de revisión anual (Art. 12.2 EUDR).</p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">4. Generación de la DDS exportable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Una vez completado el scoring y la verificación de legalidad, la plataforma genera un paquete de evidencia consolidado que incluye:</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground leading-relaxed mb-3 space-y-1">
          <li>Resumen ejecutivo con score y nivel de riesgo EUDR.</li>
          <li>Desglose de los 5 factores de scoring con contribuciones individuales.</li>
          <li>Estado de los 8 ámbitos de legalidad con evidencia documental adjunta.</li>
          <li>Historial satelital GeoBosques de la parcela post-2020.</li>
          <li>Clasificación SERFOR del uso de suelo.</li>
          <li>Referencias al OJ C/2025/4524 y al DS 020-2015-MINAGRI.</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">El paquete se exporta en PDF con share link temporal y token de acceso. Toda la evidencia queda registrada en la pista de auditoría cronológica de la plataforma.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">5. Copiloto documental EUDR</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">La plataforma incluye un copiloto de preparación documental que recupera fragmentos del Diario Oficial de la UE (OJ C/2025/4524) con citas explícitas. No sustituye la asesoría legal, pero acelera la preparación de evidencia.</p>
        <p className="text-sm text-muted-foreground leading-relaxed">El copiloto opera en modo léxico (palabras clave sobre el corpus versionado) o en modo híbrido (embeddings + puntuación léxica) si se configura una clave de API. Todas las consultas se registran en un log de auditoría append-only con hash SHA-256 de las preguntas.</p>
      </section>

      <section className="border-t-2 border-foreground pt-8">
        <h2 className="text-xl font-bold tracking-tight uppercase mb-4">La ventaja agroforestal peruana</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">El café y cacao peruanos se cultivan mayoritariamente bajo sombra en sistemas agroforestales. El EUDR Art. 2(6) excluye estos sistemas de la definición de bosque — son uso agrario. El OJ C/2025/4524 (Cap. 4.d) de la Comisión Europea confirma esta interpretación.</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Perú cuenta con el Decreto Supremo 020-2015-MINAGRI que define legalmente los sistemas agroforestales. Esto significa que una parcela de café bajo sombra en San Martín que siempre fue agroforestal <strong>no fue deforestada</strong>. La plataforma documenta este argumento con evidencia de SERFOR, GeoBosques y la legislación peruana aplicable.</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-6"><strong>Aviso legal</strong>: Forest Trace AI es una herramienta de apoyo documental. No constituye asesoría jurídica ni certificación EUDR. La responsabilidad del cumplimiento corresponde al operador económico y a sus asesores calificados.</p>
      </section>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/" className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">← Volver al inicio</Link>
      </div>
    </main>
  )
}
