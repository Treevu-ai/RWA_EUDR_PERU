"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  { id: 1, quote: "Forest Trace AI nos permitio organizar la evidencia de nuestras 12 fincas de cafe en San Martin. El scoring automatico identifico brechas de documentacion que no habiamos visto. Ahora nuestro DDS esta listo para el comprador europeo.", author: "Cooperativa Valle Verde", role: "SAN MARTIN, PERU" },
  { id: 2, quote: "Como exportador, necesitabamos una herramienta que unificara la trazabilidad desde 200 productores. Forest Trace nos dio visibilidad completa y el copiloto EUDR resolvio dudas tecnicas en minutos, no en dias.", author: "Exportadora del Oriente", role: "CAJAMARCA, PERU" },
  { id: 3, quote: "El argumento agroforestal que documenta la plataforma cambio nuestra conversacion con el comprador en Belgica. Pasamos de 'estamos trabajando en cumplir' a 'aqui esta la evidencia de que cumplimos'.", author: "Asociacion de Productores Alto Mayo", role: "MOYOBAMBA, PERU" },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const prev = () => setActive(p => (p - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive(p => (p + 1) % testimonials.length)
  return (<section className="w-full px-6 py-20 lg:px-12"><div className="flex items-center gap-4 mb-8"><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{"// SECCION: CASOS_PILOTO"}</span><div className="flex-1 border-t border-border"/><span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">007</span></div><div className="max-w-3xl"><div className="relative border-2 border-foreground p-8"><motion.blockquote key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-base md:text-lg text-foreground leading-relaxed mb-6 min-h-[100px] font-mono">{testimonials[active].quote}</motion.blockquote><div className="flex items-center justify-between"><div><p className="text-sm font-mono font-bold text-foreground">{testimonials[active].author}</p><p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{testimonials[active].role}</p></div><div className="flex gap-2"><button onClick={prev} className="p-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"><ChevronLeft className="h-4 w-4"/></button><button onClick={next} className="p-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"><ChevronRight className="h-4 w-4"/></button></div></div></div></div></section>)
}
