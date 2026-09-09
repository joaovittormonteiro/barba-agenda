-- Execute este arquivo no SQL Editor do Supabase antes de usar o app.
create extension if not exists btree_gist;

create type public.user_role as enum ('owner', 'customer');
create type public.appointment_status as enum ('confirmed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now()
);
-- O perfil é criado automaticamente quando o Auth cria o usuário.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'), coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create table public.barbershops (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, address text not null, city text not null, opening_hours text not null, photo_url text, created_at timestamptz not null default now()
);
create table public.barbers (
  id uuid primary key default gen_random_uuid(), barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null, photo_url text, created_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(), barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null, duration_minutes integer not null check (duration_minutes between 5 and 480), price numeric(10,2) not null check (price >= 0), created_at timestamptz not null default now()
);
-- Regra semanal: 0=domingo e 6=sábado. Um barbeiro pode ter mais de uma faixa no dia.
create table public.availability (
  id uuid primary key default gen_random_uuid(), barber_id uuid not null references public.barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), starts_at time not null, ends_at time not null,
  check (ends_at > starts_at)
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id),
  barbershop_id uuid not null references public.barbershops(id), barber_id uuid not null references public.barbers(id),
  service_id uuid not null references public.services(id), starts_at timestamptz not null, ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed', created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
-- Barreiras também no banco: dois agendamentos confirmados do mesmo barbeiro não podem se sobrepor.
alter table public.appointments add constraint no_barber_overlap exclude using gist
  (barber_id with =, tstzrange(starts_at, ends_at, '[)') with &&) where (status = 'confirmed');

create or replace function public.create_appointment(p_barber_id uuid, p_service_id uuid, p_starts_at timestamptz)
returns public.appointments language plpgsql security definer set search_path = public as $$
declare v_service public.services; v_barber public.barbers; v_end timestamptz; v_appointment public.appointments;
begin
  if (select role from public.profiles where id = auth.uid()) <> 'customer' then raise exception 'Apenas clientes podem agendar'; end if;
  select * into v_service from services where id = p_service_id;
  select * into v_barber from barbers where id = p_barber_id;
  if v_service.id is null or v_barber.id is null or v_service.barbershop_id <> v_barber.barbershop_id then raise exception 'Serviço ou barbeiro inválido'; end if;
  v_end := p_starts_at + make_interval(mins => v_service.duration_minutes);
  if not exists (select 1 from availability where barber_id = p_barber_id and weekday = extract(dow from p_starts_at at time zone 'America/Sao_Paulo') and starts_at <= (p_starts_at at time zone 'America/Sao_Paulo')::time and ends_at >= (v_end at time zone 'America/Sao_Paulo')::time) then raise exception 'Horário fora da disponibilidade'; end if;
  insert into appointments(customer_id, barbershop_id, barber_id, service_id, starts_at, ends_at)
  values(auth.uid(), v_barber.barbershop_id, p_barber_id, p_service_id, p_starts_at, v_end) returning * into v_appointment;
  return v_appointment;
end $$;

alter table public.profiles enable row level security; alter table public.barbershops enable row level security;
alter table public.barbers enable row level security; alter table public.services enable row level security;
alter table public.availability enable row level security; alter table public.appointments enable row level security;
create policy "profiles own" on profiles for select using (id = auth.uid());
create policy "owners see appointment customers" on profiles for select using (
  exists (select 1 from appointments a join barbershops s on s.id = a.barbershop_id where a.customer_id = profiles.id and s.owner_id = auth.uid())
);
create policy "shops public read" on barbershops for select using (true);
create policy "owners manage shops" on barbershops for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "barbers public read" on barbers for select using (true);
create policy "services public read" on services for select using (true);
create policy "availability public read" on availability for select using (true);
create policy "owners manage barbers" on barbers for all using (exists(select 1 from barbershops s where s.id=barbershop_id and s.owner_id=auth.uid()));
create policy "owners manage services" on services for all using (exists(select 1 from barbershops s where s.id=barbershop_id and s.owner_id=auth.uid()));
create policy "owners manage availability" on availability for all using (exists(select 1 from barbers b join barbershops s on s.id=b.barbershop_id where b.id=barber_id and s.owner_id=auth.uid()));
create policy "customers see own appointments" on appointments for select using (customer_id = auth.uid());
create policy "owners see shop appointments" on appointments for select using (exists(select 1 from barbershops s where s.id=barbershop_id and s.owner_id=auth.uid()));
create policy "owners delete shop appointments" on appointments for delete using (exists(select 1 from barbershops s where s.id=barbershop_id and s.owner_id=auth.uid()));
grant execute on function public.create_appointment(uuid, uuid, timestamptz) to authenticated;
