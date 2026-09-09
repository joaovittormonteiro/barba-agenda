import { createBrowserClient } from '@supabase/ssr'

// Cliente usado somente em componentes com 'use client'. Nunca coloque a service_role aqui.
export const supabase = createBrowserClient(
  // Os valores reais ficam em .env.local. Os placeholders permitem compilar o projeto antes da configuração.
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)
