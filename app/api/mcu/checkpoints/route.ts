import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@app/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('mcu_checkpoints')
      .select('code, name, sequence, is_active')
      .eq('is_active', true)
      .order('sequence', { ascending: true })

    if (error) throw error

    return NextResponse.json({ ok: true, checkpoints: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: 'Failed to load checkpoints', details: String(err) },
      { status: 500 }
    )
  }
}
