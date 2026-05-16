"use client"
import { ArrowRight, Leaf } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
export function HeroSection() {
  const [daysToPYME, setDaysToPYME] = useState("—")
  useEffect(() => { const d = new Date("2026-06-30T00:00:00Z"); const u = () => { const n = new Date(); const df = Math.ceil((d.getTime() - n.getTime()) / 86400000); setDaysToPYME(df > 0 ? `${df} dias` : df === 0 ? "Hoy" : `Hace ${Math.abs(df)} dias`) }; u(); const t = setInterval(u, 60000); return () => clearInterval(t) }, [])
  return (
    <section className="relative w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 lg:px-12 lg:pt-8 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground font-mono sm:text-[10px]">Reglamento (UE) 2023/1115</span>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6 }} className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-1 select-none leading-[1.1]">CUMPLIMIENTO</motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 0.1 }} className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-1 select-none leading-[1.1]">EUDR</motion.h1>
        <div className="w-full max-w-full sm:max-w-2xl my-4 sm:my-6 border-2 border-foreground px-3 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8">
            {["RECOPILAR","EVALUAR","EMITIR DDS"].map((l,i)=>(
              <div key={i} className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-foreground flex items-center justify-center"><span className="text-[10px] sm:text-xs font-bold">{i+1}</span></div>
                <span className="text-[7px] sm:text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-mono text-center leading-tight">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 0.2 }} className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-2 select-none leading-[1.1]">FOREST TRACE AI</motion.h1>
        <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground max-w-xs sm:max-w-md mb-4 font-mono leading-relaxed px-2">Plataforma SaaS de trazabilidad, scoring y DDS para cumplimiento EUDR. Disenada para cooperativas y exportadores peruanos de cafe y cacao.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">PYMES: {daysToPYME}</span>
          <span className="h-1.5 w-1.5 bg-[#ea580c] animate-blink hidden sm:inline-block" />
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">$800M+ en riesgo</span>
        </div>
        <a href="mailto:sinapsisinnovadoraperu@gmail.com?subject=Demo%20Forest%20Trace%20AI" className="group flex items-center gap-0 bg-foreground text-background text-xs sm:text-sm font-mono tracking-wider uppercase w-full sm:w-auto justify-center">
          <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#ea580c]"><ArrowRight size={14} className="text-background sm:w-4 sm:h-4" /></span>
          <span className="px-4 py-2 sm:px-5 sm:py-2.5">Solicitar demo</span>
        </a>
      </div>
    </section>
  )
}
