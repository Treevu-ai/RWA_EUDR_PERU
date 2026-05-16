"use client"
import { useEffect, useState } from "react"
const LINES = ["> Lote: LOT-0001 | Cafe | San Martin","> Geolocalizacion: -6.1234, -76.9876 (WGS84)","> NDVI change: 0.15 | Location risk: 0.10","> Data quality: 0.05 | Corruption idx: 0.35","> Supply chain complexity: 0.20","> --- Scoring v1.1 ---","> 0.15*0.40 + 0.10*0.20 + 0.05*0.20","> + 0.20*0.10 + 0.35*0.10","> SCORE: 0.145 -> NIVEL: NEGLIGIBLE","> Art. 2.26 EUDR: riesgo despreciable","> 4/8 ambitos de legalidad verificados","> SUNARP OK | SERFOR OK | SENASA OK | SUNAT OK","> DDS generado: PDF + share link"]
export function TerminalCard() {
  const [lines, setLines] = useState<string[]>([])
  const [cl, setCl] = useState(0)
  useEffect(() => { const iv = setInterval(() => { setCl(p => { const n = p + 1; if (n >= LINES.length) { setLines([]); return 0 }; setLines(l => [...l.slice(-8), LINES[n]]); return n }) }, 600); setLines([LINES[0]]); return () => clearInterval(iv) }, [])
  return (<div className="flex flex-col h-full"><div className="flex items-center gap-2 border-b-2 border-foreground px-4 py-2"><span className="h-2 w-2 bg-[#ea580c]"/><span className="h-2 w-2 bg-foreground"/><span className="h-2 w-2 border border-foreground"/><span className="ml-auto text-[10px] tracking-widest text-muted-foreground uppercase">scoring.log</span></div><div className="flex-1 bg-foreground p-4 overflow-hidden"><div className="flex flex-col gap-0.5">{lines.map((l,i)=>(<span key={`${cl}-${i}`} className="text-xs text-background font-mono block" style={{opacity:i===lines.length-1?1:0.6}}>{l}</span>))}<span className="text-xs text-[#ea580c] font-mono animate-blink">_</span></div></div></div>)
}
