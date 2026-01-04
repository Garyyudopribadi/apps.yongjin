import { NextResponse } from 'next/server'
import { supabase } from '@app/lib/supabase'

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
