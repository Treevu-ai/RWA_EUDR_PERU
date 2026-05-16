"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  { id: 1, quote: "Forest Trace AI nos permitio organizar la evidencia de nuestras 12 fincas de cafe en San Martin. El scoring automatico identifico brechas que no habiamos visto.", author: "Cooperativa Valle Verde", role: "SAN MARTIN" },
  { id: 2, quote: "Como exportador, necesitabamos unificar la trazabilidad desde 200 productores. Forest Trace nos dio visibilidad completa y el copiloto EUDR resolvio dudas en minutos.", author: "Exportadora del Oriente", role: "CAJAMARCA" },
  { id: 3, quote: "El argumento agroforestal que documenta la plataforma cambio nuestra conversacion con el comprador en Belgica.", author: "Asoc. Alto Mayo", role: "MOYOBAMBA" },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(p => (p - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive(p => (p + 1) % testimonials.length)
  return (<section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20"><div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"><span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{"// SECCION: CASOS_PILOTO"}</span><div className="flex-1 border-t border-border"/><span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">007</span></div><div className="max-w-3xl"><div className="relative border-2 border-foreground p-4 sm:p-8"><motion.blockquote key={active} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="text-sm sm:text-base md:text-lg text-foreground leading-relaxed mb-4 sm:mb-6 min-h-[80px] sm:min-h-[100px] font-mono">{testimonials[active].quote}</motion.blockquote><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-mono font-bold text-foreground">{testimonials[active].author}</p><p className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{testimonials[active].role}</p></div><div className="flex gap-1 sm:gap-2"><button onClick={prev} className="p-1.5 sm:p-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"><ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4"/></button><button onClick={next} className="p-1.5 sm:p-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"><ChevronRight className="h-3 w-3 sm:h-4 sm:w-4"/></button></div></div></div></div></section>)
}
