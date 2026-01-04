import { NextResponse } from 'next/server'
import { z } from 'zod'

import { supabaseAdmin } from '@app/lib/supabaseAdmin'

const QuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  status: z.enum(['in_progress', 'finished']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  entity: z.string().trim().min(1).optional(),
  facility: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  stuckMinutes: z.coerce.number().int().min(1).max(24 * 60).optional(),
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse({
      year: url.searchParams.get('year') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      entity: url.searchParams.get('entity') ?? undefined,
      facility: url.searchParams.get('facility') ?? undefined,
      department: url.searchParams.get('department') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
      stuckMinutes: url.searchParams.get('stuckMinutes') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: 'Invalid query', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const year = parsed.data.year ?? new Date().getFullYear()
    const limit = parsed.data.limit ?? 200

    let q = supabaseAdmin
      .from('mcu_live_sessions')
      .select(
        [
          'session_id',
          'year',
          'status',
          'started_at',
          'finished_at',
          'updated_at',
          'participant_id',
          'nik',
          'entity',
          'facility',
          'department',
          'department_detail',
          'ame',
          'last_scanned_at',
          'last_scan_age_minutes',
          'last_checkpoint_code',
          'last_checkpoint_name',
          'last_checkpoint_sequence',
          'checkpoints_done',
          'checkpoints_total',
        ].join(',')
      )
      .eq('year', year)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (parsed.data.status) {
      q = q.eq('status', parsed.data.status)
    }

    if (parsed.data.entity) {
      q = q.ilike('entity', `%${parsed.data.entity}%`)
    }
    if (parsed.data.facility) {
      q = q.ilike('facility', `%${parsed.data.facility}%`)
    }
    if (parsed.data.department) {
      q = q.ilike('department', `%${parsed.data.department}%`)
    }
    if (parsed.data.q) {
      const term = parsed.data.q.replace(/,/g, ' ')
      q = q.or(
        [
          `nik.ilike.%${term}%`,
          `department.ilike.%${term}%`,
          `department_detail.ilike.%${term}%`,
          `facility.ilike.%${term}%`,
          `entity.ilike.%${term}%`,
          `last_checkpoint_name.ilike.%${term}%`,
        ].join(',')
      )
    }
    if (parsed.data.stuckMinutes) {
      // Only meaningful for ongoing sessions; still allow caller to override status explicitly.
      if (!parsed.data.status) q = q.eq('status', 'in_progress')
      q = q.gte('last_scan_age_minutes', parsed.data.stuckMinutes)
    }

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ ok: true, year, items: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: 'Failed to load live dashboard', details: String(err) },
      { status: 500 }
    )
  }
}
