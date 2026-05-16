"use client"
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
export function HeroSection() {
  const [daysToPYME, setDaysToPYME] = useState("—")
  useEffect(() => { const d = new Date("2026-06-30T00:00:00Z"); const u = () => { const n = new Date(); const df = Math.ceil((d.getTime() - n.getTime()) / 86400000); setDaysToPYME(df > 0 ? `${df} dias` : df === 0 ? "Hoy" : `Hace ${Math.abs(df)} dias`) }; u(); const t = setInterval(u, 60000); return () => clearInterval(t) }, [])
  return (
    <section className="relative w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 lg:px-12 lg:pt-8 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-4 px-3 py-1.5 border border-foreground/20">
          <ShieldCheck size={12} className="text-[#ea580c]" />
          <span className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground font-mono sm:text-[10px]">Reglamento (UE) 2023/1115 · EUDR</span>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6 }} className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-1 select-none leading-[1.1]">EXPORTA A EUROPA</motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 0.1 }} className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-3 select-none leading-[1.1]">SIN RECHAZOS</motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mb-3 font-mono leading-relaxed">Tu Declaracion de Debida Diligencia lista en minutos.<br className="hidden sm:block"/>Geolocalizacion · Scoring de riesgo · Evidencia verificable.</motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg w-full my-4 sm:my-6">
          {[{v:"$800M+",l:"exportaciones peruanas en riesgo"},{v:"2M",l:"productores sin parcela geolocalizada"},{v:daysToPYME,l:"hasta 30 jun 2026 para PYMES"}].map((s,i)=>(<div key={i} className="border-2 border-foreground px-2 py-3 sm:px-4 sm:py-4 flex flex-col items-center gap-1"><span className="text-lg sm:text-2xl lg:text-3xl font-mono font-bold text-foreground">{s.v}</span><span className="text-[7px] sm:text-[9px] tracking-[0.1em] uppercase text-muted-foreground font-mono text-center leading-tight">{s.l}</span></div>))}
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 mb-5"><Leaf size={14} className="text-[#ea580c]" /><span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono">Forest Trace AI · Plataforma de cumplimiento EUDR</span></motion.p>
        <motion.a initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} href="mailto:sinapsisinnovadoraperu@gmail.com?subject=Demo%20Forest%20Trace%20AI" className="group flex items-center gap-0 bg-foreground text-background text-sm sm:text-base font-mono tracking-wider uppercase w-full sm:w-auto justify-center"><span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#ea580c]"><ArrowRight size={16} className="text-background" /></span><span className="px-5 py-3 sm:px-6 sm:py-3.5">Solicitar demo gratuita</span></motion.a>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-3 font-mono">Evaluacion de tu cadena en 20 minutos · Sin compromiso</p>
      </div>
    </section>
  )
}
