import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phzyooddlafqozryxcqa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenlvb2RkbGFmcW96cnl4Y3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTU4OTAsImV4cCI6MjA3NzYzMTg5MH0.CnwT-b-t4kxjFfbAjogb7dTFIAgkwdgPHgrB3QCmsc0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)