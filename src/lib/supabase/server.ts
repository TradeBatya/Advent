import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createServerClient() {
  return createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}
