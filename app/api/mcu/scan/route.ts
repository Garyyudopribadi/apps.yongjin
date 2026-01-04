import { NextResponse } from 'next/server'
import { z } from 'zod'

import { supabaseAdmin } from '@app/lib/supabaseAdmin'

const BodySchema = z.object({
  nik: z.string().trim().min(1),
  checkpointCode: z.string().trim().min(1),
  year: z.number().int().min(2000).max(2100).optional(),
  deviceId: z.string().trim().min(1).optional(),
})

async function getOrCreateParticipant(nik: string) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('mcu_participants')
    .select('id, nik')
    .eq('nik', nik)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  const { data: created, error: createError } = await supabaseAdmin
    .from('mcu_participants')
    .insert({ nik })
    .select('id, nik')
    .single()

  if (createError) throw createError
  return created
}

async function getOrCreateSession(participantId: string, year: number) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('mcu_sessions')
    .select('id, participant_id, year, status, started_at, finished_at')
    .eq('participant_id', participantId)
    .eq('year', year)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  const { data: created, error: createError } = await supabaseAdmin
    .from('mcu_sessions')
    .insert({ participant_id: participantId, year })
    .select('id, participant_id, year, status, started_at, finished_at')
    .single()

  if (createError) throw createError
  return created
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: 'Invalid body', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { nik, checkpointCode, deviceId } = parsed.data
    const year = parsed.data.year ?? new Date().getFullYear()

    const participant = await getOrCreateParticipant(nik)
    const session = await getOrCreateSession(participant.id, year)

    const { data: checkpoint, error: checkpointError } = await supabaseAdmin
      .from('mcu_checkpoints')
      .select('id, code, name, sequence')
      .eq('code', checkpointCode)
      .maybeSingle()

    if (checkpointError) throw checkpointError
    if (!checkpoint) {
      return NextResponse.json(
        { ok: false, message: `Unknown checkpointCode: ${checkpointCode}` },
        { status: 404 }
      )
    }

    const { data: scanEvent, error: insertError } = await supabaseAdmin
      .from('mcu_scan_events')
      .insert({
        session_id: session.id,
        checkpoint_id: checkpoint.id,
        source: 'web',
        device_id: deviceId ?? null,
      })
      .select('id, session_id, checkpoint_id, scanned_at')
      .single()

    if (insertError) throw insertError

    const { data: updatedSession, error: sessionReloadError } = await supabaseAdmin
      .from('mcu_sessions')
      .select('id, participant_id, year, status, started_at, finished_at')
      .eq('id', session.id)
      .single()

    if (sessionReloadError) throw sessionReloadError

    return NextResponse.json({
      ok: true,
      participant,
      session: updatedSession,
      checkpoint,
      scanEvent,
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: 'Failed to scan', details: String(err) },
      { status: 500 }
    )
  }
}
