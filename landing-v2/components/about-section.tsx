"use client"
import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_./:"
  useEffect(() => { if (!inView) return; let it = 0; const iv = setInterval(() => { setDisplay(text.split("").map((c,i)=>{ if (c===" ") return " "; if (i<it) return text[i]; return chars[Math.floor(Math.random()*chars.length)] }).join("")); it+=0.5; if (it>=text.length) { setDisplay(text); clearInterval(iv) } }, 30); return () => clearInterval(iv) }, [inView, text])
  return <span ref={ref} className={className}>{display}</span>
}
function BlinkDot() { return <span className="inline-block h-2 w-2 bg-[#ea580c] animate-blink" /> }

const STATS = [
  { label: "EXPORTACIONES_EN_RIESGO", value: "$800M+" },
  { label: "PRODUCTORES_SIN_GEO", value: "1.9M" },
  { label: "AMBITOS_LEGALIDAD", value: "8" },
  { label: "PLAZO_PYMES", value: "30/JUN/26" },
]
function StatBlock({ label, value, index }: { label: string; value: string; index: number }) {
  return (<motion.div initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }} className="flex flex-col gap-1 border-2 border-foreground px-4 py-3"><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{label}</span><span className="text-xl lg:text-2xl font-mono font-bold tracking-tight"><ScrambleText text={value} /></span></motion.div>)
}

export function AboutSection() {
  return (<section className="w-full px-6 py-20 lg:px-12">
    <div className="flex items-center gap-4 mb-8"><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{"// SECCION: PERU_AGROFORESTAL"}</span><div className="flex-1 border-t border-border"/><BlinkDot/><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">005</span></div>
    <div className="flex flex-col lg:flex-row gap-0 border-2 border-foreground">
      <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[500px] border-b-2 lg:border-b-0 lg:border-r-2 border-foreground overflow-hidden bg-foreground">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-foreground/80 backdrop-blur-sm"><span className="text-[10px] tracking-[0.2em] uppercase text-background/60 font-mono">RENDER: agroforestal_peru.map</span><span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">ACTIVO</span></div>
        <Image src="/images/about-isometric.jpg" alt="Sistemas agroforestales de cafe y cacao en Peru" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-foreground/80 backdrop-blur-sm"><span className="text-[10px] tracking-[0.2em] uppercase text-background/40 font-mono">{"REGION: SAN_MARTIN / CAJAMARCA"}</span><span className="text-[10px] tracking-[0.2em] uppercase text-background/40 font-mono">{"DS 020-2015-MINAGRI"}</span></div>
      </div>
      <div className="flex flex-col w-full lg:w-1/2">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground"><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">MANIFEST.md</span><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">v2.0.0</span></div>
        <div className="flex-1 flex flex-col justify-between px-5 py-6 lg:py-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl lg:text-3xl font-mono font-bold tracking-tight uppercase text-balance">Peru: la ventaja<br/><span className="text-[#ea580c]">agroforestal</span></h2>
            <div className="flex flex-col gap-4">
              <p className="text-xs lg:text-sm font-mono text-muted-foreground leading-relaxed">El cafe y cacao peruanos se cultivan mayoritariamente en sistemas agroforestales bajo sombra. Bajo el EUDR Art. 2(6), estos sistemas NO califican como bosque — son uso agrario. El OJ C/2025/4524 (Cap. 4.d) de la Comision Europea lo confirma.</p>
              <p className="text-xs lg:text-sm font-mono text-muted-foreground leading-relaxed">Peru cuenta con el DS 020-2015-MINAGRI que define legalmente estos sistemas. Forest Trace AI documenta este argumento con evidencia de SERFOR, GeoBosques, MIDAGRI y SENASA para que su DDS sea solido desde el origen.</p>
            </div>
            <div className="flex items-center gap-3 py-3 border-t-2 border-b-2 border-foreground"><span className="h-1.5 w-1.5 bg-[#ea580c]"/><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">ENTIDADES ALINEADAS: MIDAGRI · SERFOR · SENASA · GeoBosques · PROMPERU · SUNARP · SUNAT</span></div>
          </div>
          <div className="grid grid-cols-2 gap-0 mt-6">{STATS.map((s,i)=>(<StatBlock key={s.label} {...s} index={i}/>))}</div>
        </div>
      </div>
    </div>
  </section>)
}
