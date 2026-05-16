"use client"
import { TerminalCard } from "@/components/bento/terminal-card"
import { DitherCard } from "@/components/bento/dither-card"
import { MetricsCard } from "@/components/bento/metrics-card"
import { StatusCard } from "@/components/bento/status-card"
import { motion } from "framer-motion"

const cv = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) }

export function FeatureGrid() {
  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">{"// SECCION: DATOS_BRUTOS"}</span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[8px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">004</span>
      </div>
      <div className="border-2 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <motion.div custom={0} variants={cv} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border-b-2 md:border-b-0 md:border-r-2 border-foreground min-h-[220px] sm:min-h-[280px]"><TerminalCard /></motion.div>
          <motion.div custom={1} variants={cv} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border-b-2 md:border-b-0 border-foreground min-h-[220px] sm:min-h-[280px]"><DitherCard /></motion.div>
          <motion.div custom={2} variants={cv} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border-t-2 md:border-r-2 border-foreground min-h-[220px] sm:min-h-[280px]"><MetricsCard /></motion.div>
          <motion.div custom={3} variants={cv} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border-t-2 border-foreground min-h-[220px] sm:min-h-[280px]"><StatusCard /></motion.div>
        </div>
      </div>
    </section>
  )
}
