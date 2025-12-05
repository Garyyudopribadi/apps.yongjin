import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phzyooddlafqozryxcqa.supabase.co'  // Replace with your Project URL from Supabase Dashboard > Settings > API
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenlvb2RkbGFmcW96cnl4Y3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTU4OTAsImV4cCI6MjA3NzYzMTg5MH0.CnwT-b-t4kxjFfbAjogb7dTFIAgkwdgPHgrB3QCmsc0'  // Replace with your anon public key

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Head select to get count (no rows)
    const { count, error } = await supabase
      .from('survey_kantin_yongjinone')
      .select('*', { head: true, count: 'exact' })

    if (error) {
      return NextResponse.json({ ok: false, message: 'Supabase query error', details: error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Supabase reachable', count: count ?? 0 })
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
