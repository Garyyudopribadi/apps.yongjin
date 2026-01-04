"use client"

import * as React from "react"

import Link from "next/link"

import { Button } from "@app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card"
import { Input } from "@app/components/ui/input"

type LiveItem = {
  session_id: string
  year: number
  status: "in_progress" | "finished" | string
  started_at: string
  finished_at: string | null
  updated_at: string
  participant_id: string
  nik: string
  entity: string | null
  facility: string | null
  department: string | null
  department_detail: string | null
  ame: string | null
  last_scanned_at: string | null
  last_scan_age_minutes: number | null
  last_checkpoint_code: string | null
  last_checkpoint_name: string | null
  last_checkpoint_sequence: number | null
  checkpoints_done: number | null
  checkpoints_total: number | null
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function MCUDashboardPage() {
  const [year, setYear] = React.useState<number>(() => new Date().getFullYear())
  const [statusFilter, setStatusFilter] = React.useState<"in_progress" | "finished" | "all">(
    "in_progress"
  )
  const [search, setSearch] = React.useState("")

  const [facility, setFacility] = React.useState("")
  const [entity, setEntity] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [stuckMinutes, setStuckMinutes] = React.useState<number>(30)

  const [items, setItems] = React.useState<LiveItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL("/api/mcu/live", window.location.origin)
      url.searchParams.set("year", String(year))
      url.searchParams.set("limit", "300")
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter)

      if (facility.trim()) url.searchParams.set("facility", facility.trim())
      if (entity.trim()) url.searchParams.set("entity", entity.trim())
      if (department.trim()) url.searchParams.set("department", department.trim())
      if (search.trim()) url.searchParams.set("q", search.trim())
      if (statusFilter === "in_progress" && stuckMinutes > 0) {
        url.searchParams.set("stuckMinutes", String(stuckMinutes))
      }

      const res = await fetch(url.toString(), { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.message ?? "Failed")
      setItems((json.items ?? []) as LiveItem[])
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }, [year, statusFilter, facility, entity, department, search, stuckMinutes])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    if (!autoRefresh) return
    const id = window.setInterval(() => {
      load()
    }, 5000)
    return () => window.clearInterval(id)
  }, [autoRefresh, load])

  const filtered = items

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MCU Live Dashboard</CardTitle>
          <CardDescription>
            Monitoring real-time peserta MCU (update tiap 5 detik).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <div className="text-sm font-medium">Tahun</div>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
                className="w-32"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Status</div>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as any)
                }
              >
                <option value="in_progress">In progress</option>
                <option value="finished">Finished</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="space-y-1 flex-1 min-w-[220px]">
              <div className="text-sm font-medium">Search</div>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="NIK / department / facility / checkpoint"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Facility</div>
              <Input
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="(optional)"
                className="w-40"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Entity</div>
              <Input
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                placeholder="(optional)"
                className="w-40"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Department</div>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="(optional)"
                className="w-40"
              />
            </div>

            {statusFilter === "in_progress" ? (
              <div className="space-y-1">
                <div className="text-sm font-medium">Stuck (menit)</div>
                <Input
                  type="number"
                  value={stuckMinutes}
                  onChange={(e) => setStuckMinutes(Number(e.target.value))}
                  min={1}
                  max={24 * 60}
                  className="w-32"
                />
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button onClick={load} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh((v) => !v)}
              >
                Auto: {autoRefresh ? "ON" : "OFF"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/mcu">Scanner</Link>
              </Button>
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">NIK</th>
                  <th className="py-2 pr-3">Dept</th>
                  <th className="py-2 pr-3">Facility</th>
                  <th className="py-2 pr-3">Progress</th>
                  <th className="py-2 pr-3">Last checkpoint</th>
                  <th className="py-2 pr-3">Last scan</th>
                  <th className="py-2 pr-3">Age (min)</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const done = it.checkpoints_done ?? 0
                  const total = it.checkpoints_total ?? 0
                  const progress = total ? `${done}/${total}` : `${done}`
                  return (
                    <tr key={it.session_id} className="border-b">
                      <td className="py-2 pr-3 font-medium">
                        <Link
                          className="underline underline-offset-2"
                          href={`/mcu?nik=${encodeURIComponent(it.nik)}&year=${encodeURIComponent(String(it.year))}`}
                        >
                          {it.nik}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">
                        {it.department}
                        {it.department_detail ? ` / ${it.department_detail}` : ""}
                      </td>
                      <td className="py-2 pr-3">{it.facility ?? "-"}</td>
                      <td className="py-2 pr-3">{progress}</td>
                      <td className="py-2 pr-3">
                        {it.last_checkpoint_sequence ? `${it.last_checkpoint_sequence}. ` : ""}
                        {it.last_checkpoint_name ?? "-"}
                      </td>
                      <td className="py-2 pr-3">{formatDateTime(it.last_scanned_at)}</td>
                      <td className="py-2 pr-3">
                        {it.last_scan_age_minutes ?? "-"}
                      </td>
                      <td className="py-2 pr-3">{it.status}</td>
                    </tr>
                  )
                })}
                {!filtered.length ? (
                  <tr>
                    <td className="py-4 text-muted-foreground" colSpan={8}>
                      Tidak ada data.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
