'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CalendarIcon, ClockIcon, MailIcon, ScissorsIcon } from '@/components/icons'

export default function ConfirmPage() { return <Suspense fallback={<p className="muted">Carregando...</p>}><ConfirmContent/></Suspense> }
function ConfirmContent() {
  const params = useSearchParams(); const [details, setDetails] = useState<{ barber?: string; service?: string }>({}); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false)
  const barber = params.get('barber')!; const service = params.get('service')!; const starts = params.get('starts')!
  useEffect(() => { Promise.all([supabase.from('barbers').select('name').eq('id', barber).single(), supabase.from('services').select('name,price,duration_minutes').eq('id', service).single()]).then(([b,s]) => setDetails({ barber: b.data?.name, service: s.data ? `${s.data.name} — R$ ${Number(s.data.price).toFixed(2)}` : undefined })) }, [barber, service])
  async function confirm() { setBusy(true); setError(''); const { error } = await supabase.rpc('create_appointment', { p_barber_id: barber, p_service_id: service, p_starts_at: starts }); setBusy(false); if (error) return setError(error.message); setDone(true) }
  const message = encodeURIComponent(`Olá! Meu agendamento de ${details.service ?? 'serviço'} com ${details.barber ?? 'o barbeiro'} foi confirmado para ${new Date(starts).toLocaleString('pt-BR')}.`)
  if (!barber || !service || !starts) return <div className="card p-8">Dados do agendamento inválidos.</div>
  if (done) return <section className="card mx-auto max-w-lg p-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400"><ScissorsIcon className="h-8 w-8"/></div><p className="eyebrow mt-5">Tudo certo</p><h1 className="mt-2 text-3xl font-bold">Agendamento confirmado!</h1><p className="muted mt-3">A confirmação por e-mail foi simulada e marcada como enviada neste MVP.</p><div className="mt-6 flex flex-col gap-3"><a className="btn-primary" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${message}`}>Enviar confirmação no WhatsApp</a><div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#B0B0B0]"><MailIcon className="text-[#D4A574]"/> E-mail de confirmação enviado (simulação)</div><Link className="btn-secondary" href="/meus-agendamentos">Ver meus agendamentos</Link></div></section>
  return <section className="card mx-auto max-w-lg p-6 sm:p-8"><p className="eyebrow">Última etapa</p><h1 className="mt-2 text-3xl font-bold">Confirmar agendamento</h1><dl className="my-7 space-y-4"><div className="rounded-xl bg-white/5 p-4"><dt className="muted flex items-center gap-2 text-sm"><ScissorsIcon className="text-[#D4A574]"/>Serviço e profissional</dt><dd className="mt-2 font-semibold">{details.service}<br/><span className="muted font-normal">com {details.barber}</span></dd></div><div className="rounded-xl bg-white/5 p-4"><dt className="muted flex items-center gap-2 text-sm"><CalendarIcon className="text-[#D4A574]"/>Data e horário</dt><dd className="mt-2 flex items-center gap-2 font-semibold"><ClockIcon className="text-[#1F77B4]"/>{new Date(starts).toLocaleString('pt-BR')}</dd></div></dl>{error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<button className="btn-primary w-full" disabled={busy} onClick={confirm}>{busy ? 'Confirmando...' : 'Confirmar agendamento'}</button></section>
}
