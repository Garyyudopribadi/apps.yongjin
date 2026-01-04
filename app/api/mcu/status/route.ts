import { NextResponse } from 'next/server'
import { z } from 'zod'

import { supabaseAdmin } from '@app/lib/supabaseAdmin'

const QuerySchema = z.object({
  nik: z.string().trim().min(1),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = QuerySchema.safeParse({
      nik: url.searchParams.get('nik') ?? '',
      year: url.searchParams.get('year') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: 'Invalid query', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const nik = parsed.data.nik
    const year = parsed.data.year ?? new Date().getFullYear()

    const { data: participant, error: participantError } = await supabaseAdmin
      .from('mcu_participants')
      .select('id, nik, entity, facility, department, department_detail, ame')
      .eq('nik', nik)
      .maybeSingle()

    if (participantError) throw participantError
    if (!participant) {
      return NextResponse.json(
        { ok: true, participant: null, session: null, checkpoints: [] },
        { status: 200 }
      )
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('mcu_sessions')
      .select('id, participant_id, year, status, started_at, finished_at')
      .eq('participant_id', participant.id)
      .eq('year', year)
      .maybeSingle()

    if (sessionError) throw sessionError
    if (!session) {
      return NextResponse.json(
        { ok: true, participant, session: null, checkpoints: [] },
        { status: 200 }
      )
    }

    const { data: checkpoints, error: checkpointsError } = await supabaseAdmin
      .from('mcu_checkpoints')
      .select('id, code, name, sequence, is_active')
      .order('sequence', { ascending: true })

    if (checkpointsError) throw checkpointsError

    const { data: statuses, error: statusError } = await supabaseAdmin
      .from('mcu_checkpoint_status')
      .select(
        'checkpoint_id, status, first_scanned_at, last_scanned_at, scan_count'
      )
      .eq('session_id', session.id)

    if (statusError) throw statusError

    const statusByCheckpoint = new Map(
      (statuses ?? []).map((s) => [s.checkpoint_id, s])
    )

    const checkpointList = (checkpoints ?? [])
      .filter((c) => c.is_active)
      .map((c) => {
        const s = statusByCheckpoint.get(c.id)
        return {
          id: c.id,
          code: c.code,
          name: c.name,
          sequence: c.sequence,
          status: s?.status ?? 'pending',
          firstScannedAt: s?.first_scanned_at ?? null,
          lastScannedAt: s?.last_scanned_at ?? null,
          scanCount: s?.scan_count ?? 0,
        }
      })

    return NextResponse.json({
      ok: true,
      participant,
      session,
      checkpoints: checkpointList,
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: 'Failed to load status', details: String(err) },
      { status: 500 }
    )
  }
}
