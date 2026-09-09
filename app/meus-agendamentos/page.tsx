'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types/database'
import { CalendarIcon, ClockIcon, ScissorsIcon } from '@/components/icons'

export default function MyAppointments() {
  const [items, setItems] = useState<Appointment[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('appointments').select('id,starts_at,ends_at,status,barber:barbers(name),service:services(name,price),barbershop:barbershops(name)').order('starts_at', { ascending: false }).then(({ data, error }) => { setItems((data as unknown as Appointment[]) ?? []); setError(error?.message ?? ''); setLoading(false) }) }, [])
  return <section><p className="eyebrow">Sua agenda</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Meus agendamentos</h1>{error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(item => <article className="card p-5" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}</p><h2 className="mt-1 text-xl font-bold">{item.barbershop?.name}</h2></div><span className="rounded-full bg-[#1F4E79]/30 p-2 text-[#75B6E8]"><ScissorsIcon/></span></div><p className="muted mt-5">{item.service?.name} com <span className="text-[#F5F5F5]">{item.barber?.name}</span></p><div className="mt-4 border-t border-white/10 pt-4 text-sm"><p className="flex items-center gap-2"><CalendarIcon className="text-[#D4A574]"/>{new Date(item.starts_at).toLocaleDateString('pt-BR')}</p><p className="muted mt-2 flex items-center gap-2"><ClockIcon className="text-[#D4A574]"/>{new Date(item.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · R$ {Number(item.service?.price).toFixed(2)}</p></div></article>)}</div>{!loading && !items.length && !error && <div className="card mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center"><CalendarIcon className="h-12 w-12 text-[#D4A574]"/><h2 className="mt-4 text-xl font-bold">Sua agenda ainda está livre</h2><p className="muted mt-2">Encontre uma barbearia e marque seu primeiro horário.</p><Link className="btn-primary mt-5" href="/barbearias">Encontrar barbearia</Link></div>}</section>
}
