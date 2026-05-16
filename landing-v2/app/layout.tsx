import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistPixelGrid } from 'geist/font/pixel'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
export const metadata: Metadata = { title: 'Forest Trace AI — Cumplimiento EUDR Automatizado', description: 'Plataforma SaaS de trazabilidad, debida diligencia y evidencia agroexportadora.', keywords: ['EUDR','cumplimiento','cafe','cacao','trazabilidad','Peru'], authors: [{ name: 'SINAPSIS INNOVADORA S.A.C.' }], robots: { index: true, follow: true } }
export const viewport: Viewport = { themeColor: '#F2F1EA', width: 'device-width', initialScale: 1 }
export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="es" className={`${jetbrainsMono.variable} ${GeistPixelGrid.variable}`} suppressHydrationWarning><body className="font-mono antialiased"><ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>{children}</ThemeProvider></body></html>) }
