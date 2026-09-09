export type UserRole = 'owner' | 'customer'
export type Barbershop = { id: string; name: string; address: string; city: string; opening_hours: string; owner_id: string; photo_url: string | null }
export type Barber = { id: string; name: string; photo_url: string | null; barbershop_id: string }
export type Service = { id: string; name: string; duration_minutes: number; price: number; barbershop_id: string }
export type Appointment = { id: string; starts_at: string; ends_at: string; status: 'confirmed' | 'cancelled'; barber: { name: string } | null; service: { name: string; price: number } | null; barbershop: { name: string } | null }
