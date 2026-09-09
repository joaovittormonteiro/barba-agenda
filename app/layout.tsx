import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'BarbaAgenda', description: 'MVP de agendamento para barbearias' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/90 backdrop-blur"><nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:gap-6"><Link className="brand-font text-xl font-bold tracking-tight text-[#C0392B] sm:text-2xl" href="/barbearias">Barba<span className="text-[#F5F5F5]">Agenda</span></Link><div className="hidden h-6 w-px bg-[#D4A574]/40 sm:block"/><Link className="text-sm text-[#B0B0B0] transition hover:text-[#D4A574]" href="/barbearias">Barbearias</Link><Link className="text-sm text-[#B0B0B0] transition hover:text-[#D4A574]" href="/meus-agendamentos">Meus agendamentos</Link><Link className="text-sm text-[#B0B0B0] transition hover:text-[#D4A574]" href="/painel">Painel</Link><Link className="ml-auto rounded-lg border border-[#1F4E79] px-3 py-2 text-sm text-[#D6E9FA] transition hover:bg-[#1F4E79]/30" href="/login">Entrar</Link></nav></header><main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main></body></html>
}
