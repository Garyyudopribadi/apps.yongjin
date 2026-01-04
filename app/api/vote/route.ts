import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'

type VoteCounts = Record<string, number>

type VoteAction = 'increment' | 'decrement'

const DATA_FILE = path.join(process.cwd(), 'data', 'vote-greendesign.json')

async function readVotes(): Promise<VoteCounts> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const result: VoteCounts = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value)) result[key] = value
    }

    return result
  } catch (error: any) {
    if (error?.code === 'ENOENT') return {}
    throw error
  }
}

async function writeVotes(votes: VoteCounts) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(votes, null, 2), 'utf8')
}

export async function GET() {
  try {
    const votes = await readVotes()
    return NextResponse.json(votes, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: 'Failed to read votes', details: String(err) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: unknown; action?: unknown }
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    const action = body.action as VoteAction

    if (!id) {
      return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 })
    }
    if (action !== 'increment' && action !== 'decrement') {
      return NextResponse.json({ ok: false, message: 'Invalid action' }, { status: 400 })
    }

    const votes = await readVotes()
    const current = votes[id] ?? 0
    const next = action === 'increment' ? current + 1 : Math.max(0, current - 1)
    votes[id] = next

    await writeVotes(votes)

    return NextResponse.json(
      { ok: true, id, count: next },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (err) {
    // If JSON parsing fails, req.json() throws.
    return NextResponse.json(
      { ok: false, message: 'Failed to update vote', details: String(err) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
