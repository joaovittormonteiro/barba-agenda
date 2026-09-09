-- Execute no SQL Editor apenas se você já executou a migration 001.
-- Permite que o dono exclua os agendamentos da sua barbearia pelo painel.
create policy "owners delete shop appointments" on public.appointments for delete
using (exists (select 1 from public.barbershops s where s.id = appointments.barbershop_id and s.owner_id = auth.uid()));
