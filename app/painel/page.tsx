'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Barber, Barbershop, Service } from '@/types/database'
import { CalendarIcon, CameraIcon, CityIcon, ClockIcon, PinIcon, ScissorsIcon, StoreIcon } from '@/components/icons'

type TableName = 'barbers' | 'services' | 'availability'

export default function OwnerPanel() {
  const [shop, setShop] = useState<Barbershop | null>(null); const [barbers, setBarbers] = useState<Barber[]>([]); const [services, setServices] = useState<Service[]>([])
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setNotice('Entre em uma conta de dono para acessar o painel.')
    const { data: foundShop } = await supabase.from('barbershops').select('*').eq('owner_id', user.id).maybeSingle()
    setShop(foundShop)
    if (foundShop) {
      const [barberResult, serviceResult] = await Promise.all([supabase.from('barbers').select('*').eq('barbershop_id', foundShop.id), supabase.from('services').select('*').eq('barbershop_id', foundShop.id)])
      setBarbers(barberResult.data ?? []); setServices(serviceResult.data ?? [])
    }
  }
  useEffect(() => { load() }, [])

  async function uploadShopPhoto(userId: string, shopId: string, file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/${shopId}/profile.${extension}`
    const { error } = await supabase.storage.from('barbershop-images').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('barbershop-images').getPublicUrl(path).data.publicUrl
  }

  async function createShop(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setBusy(true); setNotice('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return setNotice('Entre em uma conta de dono.') }
    const { data: created, error } = await supabase.from('barbershops').insert({ owner_id: user.id, name: String(data.get('name')), address: String(data.get('address')), city: String(data.get('city')), opening_hours: String(data.get('hours')) } as never).select('*').single()
    if (error || !created) { setBusy(false); return setNotice(error?.message ?? 'Não foi possível cadastrar.') }
    const photo = data.get('photo')
    if (photo instanceof File && photo.size > 0) {
      try { const photoUrl = await uploadShopPhoto(user.id, created.id, photo); await supabase.from('barbershops').update({ photo_url: photoUrl } as never).eq('id', created.id) }
      catch (uploadError) { setNotice(`Barbearia cadastrada, mas a foto falhou: ${(uploadError as Error).message}. Execute a migration 003.`) }
    }
    setBusy(false); form.reset(); if (!notice) setNotice('Barbearia cadastrada com sucesso.'); await load()
  }

  async function updatePhoto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!shop) return; const form = e.currentTarget; const file = new FormData(form).get('photo'); if (!(file instanceof File) || !file.size) return
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return
    setBusy(true)
    try { const url = await uploadShopPhoto(user.id, shop.id, file); const { error } = await supabase.from('barbershops').update({ photo_url: url } as never).eq('id', shop.id); setNotice(error?.message ?? 'Foto atualizada.'); if (!error) await load() }
    catch (error) { setNotice(`${(error as Error).message}. Confirme se a migration 003 foi executada.`) }
    setBusy(false)
  }

  async function addResource(e: FormEvent<HTMLFormElement>, table: TableName) {
    e.preventDefault(); if (!shop) return; const form = e.currentTarget; const data = new FormData(form)
    const row = table === 'barbers' ? { barbershop_id: shop.id, name: data.get('name'), photo_url: data.get('photo_url') || null } : table === 'services' ? { barbershop_id: shop.id, name: data.get('name'), duration_minutes: Number(data.get('duration')), price: Number(data.get('price')) } : { barber_id: data.get('barber_id'), weekday: Number(data.get('weekday')), starts_at: data.get('starts_at'), ends_at: data.get('ends_at') }
    const { error } = await supabase.from(table).insert(row as never); setNotice(error?.message ?? 'Salvo com sucesso.'); if (!error) { form.reset(); await load() }
  }

  async function deleteShop() {
    if (!shop || !window.confirm(`Excluir “${shop.name}” e todos os dados vinculados?`)) return
    const appointments = await supabase.from('appointments').delete().eq('barbershop_id', shop.id); if (appointments.error) return setNotice(appointments.error.message)
    const result = await supabase.from('barbershops').delete().eq('id', shop.id); if (result.error) return setNotice(result.error.message)
    setShop(null); setBarbers([]); setServices([]); setNotice('Barbearia excluída.')
  }

  if (!shop) return <section className="mx-auto max-w-3xl"><p className="eyebrow">Área do proprietário</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Cadastre sua barbearia</h1><p className="muted mt-2">Preencha as informações que seus clientes verão na busca.</p>{notice && <Notice text={notice}/>}<form className="card mt-7 space-y-5 p-6 sm:p-8" onSubmit={createShop}>
    <Field label="Nome da barbearia" icon={<StoreIcon/>}><input className="field-with-icon" required name="name" placeholder="Ex.: Barbearia Central"/></Field>
    <Field label="Endereço" icon={<PinIcon/>}><input className="field-with-icon" required name="address" placeholder="Rua, número e bairro"/></Field>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Cidade" icon={<CityIcon/>}><input className="field-with-icon" required name="city" placeholder="Ex.: São Paulo"/></Field><Field label="Horário de funcionamento" icon={<ClockIcon/>}><input className="field-with-icon" required name="hours" placeholder="Seg–Sex, 09:00–19:00"/></Field></div>
    <label><span className="field-label">Foto de perfil ou capa</span><div className="rounded-xl border border-dashed border-[#D4A574]/40 bg-[#D4A574]/5 p-5"><CameraIcon className="mb-2 text-[#D4A574]"/><input className="block w-full text-sm text-[#B0B0B0] file:mr-4 file:rounded-lg file:border-0 file:bg-[#1F4E79] file:px-4 file:py-2 file:text-white" name="photo" type="file" accept="image/png,image/jpeg,image/webp"/><p className="muted mt-2 text-xs">PNG, JPG ou WebP.</p></div></label>
    <button className="btn-primary w-full sm:w-auto" disabled={busy}>{busy ? 'Cadastrando...' : 'Cadastrar barbearia'}</button>
  </form></section>

  return <section><div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Área do proprietário</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{shop.name}</h1><p className="muted mt-2">Gerencie sua equipe, serviços e agenda.</p></div><button className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10" onClick={deleteShop}>Excluir barbearia</button></div>{notice && <Notice text={notice}/>}<div className="grid gap-6 lg:grid-cols-3">
    <section className="card overflow-hidden lg:col-span-1"><div className="h-48 bg-[#191919]">{shop.photo_url ? <img className="h-full w-full object-cover" src={shop.photo_url} alt={shop.name}/> : <div className="flex h-full items-center justify-center"><CameraIcon className="h-12 w-12 text-[#D4A574]/60"/></div>}</div><form className="space-y-3 p-5" onSubmit={updatePhoto}><h2 className="text-lg font-bold">Foto da barbearia</h2><input className="block w-full text-xs text-[#B0B0B0] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1F4E79] file:px-3 file:py-2 file:text-white" required name="photo" type="file" accept="image/png,image/jpeg,image/webp"/><button className="btn-secondary w-full" disabled={busy}>Atualizar foto</button></form></section>
    <form className="card space-y-4 p-6" onSubmit={e => addResource(e, 'barbers')}><div><p className="eyebrow">Equipe</p><h2 className="mt-1 text-xl font-bold">Adicionar barbeiro</h2></div><Field label="Nome" icon={<ScissorsIcon/>}><input className="field-with-icon" required name="name" placeholder="Nome do profissional"/></Field><label><span className="field-label">URL da foto (opcional)</span><input className="field" name="photo_url" type="url" placeholder="https://..."/></label><button className="btn-primary w-full">Adicionar barbeiro</button><div className="space-y-2 border-t border-white/10 pt-4">{barbers.map(barber => <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3" key={barber.id}>{barber.photo_url ? <img className="h-9 w-9 rounded-full object-cover" src={barber.photo_url} alt=""/> : <ScissorsIcon className="text-[#D4A574]"/>}<span>{barber.name}</span></div>)}</div></form>
    <form className="card space-y-4 p-6" onSubmit={e => addResource(e, 'services')}><div><p className="eyebrow">Cardápio</p><h2 className="mt-1 text-xl font-bold">Adicionar serviço</h2></div><label><span className="field-label">Nome do serviço</span><input className="field" required name="name" placeholder="Corte, barba, lavagem..."/></label><div className="grid grid-cols-2 gap-3"><label><span className="field-label">Duração</span><input className="field" required name="duration" type="number" min="5" placeholder="Minutos"/></label><label><span className="field-label">Preço</span><input className="field" required name="price" type="number" min="0" step="0.01" placeholder="R$"/></label></div><button className="btn-primary w-full">Adicionar serviço</button><div className="space-y-2 border-t border-white/10 pt-4">{services.map(service => <div className="flex items-center justify-between rounded-xl bg-white/5 p-3" key={service.id}><span>{service.name}<small className="muted block">{service.duration_minutes} min</small></span><b className="text-[#D4A574]">R$ {Number(service.price).toFixed(2)}</b></div>)}</div></form>
  </div>
  <form className="card mt-6 grid gap-4 p-6 md:grid-cols-4 md:items-end" onSubmit={e => addResource(e, 'availability')}><div className="md:col-span-4"><p className="eyebrow">Agenda da equipe</p><h2 className="mt-1 text-xl font-bold">Disponibilidade do barbeiro</h2></div><label><span className="field-label">Barbeiro</span><select className="field" required name="barber_id"><option value="">Escolha</option>{barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}</select></label><label><span className="field-label">Dia da semana</span><select className="field" name="weekday"><option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option><option value="6">Sábado</option><option value="0">Domingo</option></select></label><label><span className="field-label">Início e fim</span><div className="flex gap-2"><input className="field" required name="starts_at" type="time"/><input className="field" required name="ends_at" type="time"/></div></label><button className="btn-secondary">Salvar horário</button></form>
  <OwnerAppointments shopId={shop.id}/></section>
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <label><span className="field-label">{label}</span><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A574]">{icon}</span>{children}</div></label> }
function Notice({ text }: { text: string }) { return <p className="mt-5 rounded-xl border border-[#D4A574]/20 bg-[#D4A574]/10 p-4 text-sm text-[#E7C5A1]">{text}</p> }
function OwnerAppointments({ shopId }: { shopId: string }) {
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('appointments').select('starts_at,barber:barbers(name),service:services(name),customer:profiles(full_name)').eq('barbershop_id', shopId).order('starts_at', { ascending: false }).then(({ data }) => { setRows(data ?? []); setLoading(false) }) }, [shopId])
  return <section className="mt-8"><p className="eyebrow">Movimento da casa</p><h2 className="mt-1 text-2xl font-bold">Agendamentos recebidos</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map((row, index) => <article className="card flex gap-4 p-4" key={index}><span className="rounded-xl bg-[#1F4E79]/30 p-3 text-[#75B6E8]"><CalendarIcon/></span><div><b>{row.customer?.full_name ?? 'Cliente'}</b><p className="muted text-sm">{row.service?.name} com {row.barber?.name}</p><p className="mt-1 text-sm text-[#D4A574]">{new Date(row.starts_at).toLocaleString('pt-BR')}</p></div></article>)}</div>{!loading && !rows.length && <div className="card mt-4 flex flex-col items-center p-8 text-center"><CalendarIcon className="h-10 w-10 text-[#D4A574]"/><h3 className="mt-3 text-lg font-bold">Agenda esperando o primeiro cliente</h3><p className="muted mt-1 text-sm">Os novos agendamentos aparecerão aqui.</p></div>}</section>
}
