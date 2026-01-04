import 'server-only'

import { createClient } from '@supabase/supabase-js'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

const supabaseUrl = requireEnv('SUPABASE_URL')
const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
