"use client"
import { Leaf, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6 lg:pt-6">
      <nav className="w-full border border-foreground/20 bg-background/80 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Leaf size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.15em] uppercase font-bold">Forest Trace</span>
          </div>
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            {["Plataforma","DDS","Peru","Planes"].map(l=><span key={l} className="text-[10px] lg:text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-default">{l}</span>)}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button className="hidden sm:block bg-foreground text-background px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase">Pedir Demo</button>
            <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="Menu">
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden mt-3 border-t border-foreground/20 pt-3 flex flex-col gap-2">
            {["Plataforma","DDS","Peru","Planes"].map(l=><span key={l} className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground py-1.5 px-2 hover:bg-foreground/5 cursor-default">{l}</span>)}
            <button className="bg-foreground text-background px-3 py-2 text-[10px] font-mono tracking-widest uppercase w-full mt-1">Pedir Demo</button>
          </div>
        )}
      </nav>
    </motion.div>
  )
}
