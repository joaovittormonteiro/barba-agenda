'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Barbershop } from '@/types/database'
import { ClockIcon, PinIcon, ScissorsIcon, SearchIcon } from '@/components/icons'

export default function ShopsPage() {
  const [shops, setShops] = useState<Barbershop[]>([])
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('barbershops').select('*').order('name').then(({ data }) => {
      setShops(data ?? []); setLoading(false)
    })
  }, [])

  const filtered = shops.filter(shop => `${shop.name} ${shop.city}`.toLowerCase().includes(term.toLowerCase()))

  return <section>
    <div className="mb-8 max-w-2xl">
      <p className="eyebrow">Seu próximo visual começa aqui</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Encontre a barbearia certa para você.</h1>
      <p className="muted mt-3 text-lg">Escolha o serviço, o profissional e reserve seu horário em poucos passos.</p>
    </div>
    <div className="relative max-w-2xl"><SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A574]"/><input className="field-with-icon" value={term} onChange={e => setTerm(e.target.value)} placeholder="Buscar por nome ou cidade"/></div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(shop => <Link className="card group overflow-hidden transition hover:-translate-y-1 hover:border-[#D4A574]/50" href={`/barbearias/${shop.id}`} key={shop.id}>
        <div className="relative h-44 bg-gradient-to-br from-[#1F4E79]/60 to-[#C0392B]/30">
          {shop.photo_url ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={shop.photo_url} alt={`Fachada da ${shop.name}`}/> : <div className="flex h-full items-center justify-center"><ScissorsIcon className="h-14 w-14 text-[#D4A574]/70"/></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent"/>
        </div>
        <div className="p-5"><h2 className="text-xl font-bold group-hover:text-[#D4A574]">{shop.name}</h2><p className="muted mt-3 flex items-start gap-2 text-sm"><PinIcon className="mt-0.5 shrink-0 text-[#C0392B]"/>{shop.address} — {shop.city}</p><p className="muted mt-2 flex items-center gap-2 text-sm"><ClockIcon className="shrink-0 text-[#1F77B4]"/>{shop.opening_hours}</p><span className="mt-5 inline-block text-sm font-semibold text-[#D4A574]">Ver serviços →</span></div>
      </Link>)}
    </div>
    {!loading && !filtered.length && <div className="card mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center"><ScissorsIcon className="h-12 w-12 text-[#D4A574]"/><h2 className="mt-4 text-xl font-bold">Nenhuma cadeira disponível por aqui</h2><p className="muted mt-2 max-w-md">Tente buscar por outro nome ou cidade. Se você é dono, cadastre a primeira barbearia.</p><Link className="btn-primary mt-5" href="/painel">Cadastrar barbearia</Link></div>}
  </section>
}
