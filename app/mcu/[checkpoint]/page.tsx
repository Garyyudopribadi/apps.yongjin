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

type Checkpoint = {
  code: string
  name: string
  sequence: number
}

type StatusCheckpoint = {
  id: string
  code: string
  name: string
  sequence: number
  status: string
  firstScannedAt: string | null
  lastScannedAt: string | null
  scanCount: number
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function MCUCheckpointKioskPage({
  params,
}: {
  params: { checkpoint: string }
}) {
  const checkpointCode = decodeURIComponent(params.checkpoint)

  const [nik, setNik] = React.useState("")
  const [year, setYear] = React.useState<number>(() => new Date().getFullYear())

  const [checkpoints, setCheckpoints] = React.useState<Checkpoint[]>([])
  const currentCheckpoint = React.useMemo(
    () => checkpoints.find((c) => c.code === checkpointCode) ?? null,
    [checkpoints, checkpointCode]
  )

  const [deviceId, setDeviceId] = React.useState("kiosk-1")

  const [loading, setLoading] = React.useState(false)
  const [statusLoading, setStatusLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [status, setStatus] = React.useState<{
    participant: any
    session: any
    checkpoints: StatusCheckpoint[]
  } | null>(null)

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mcu_device_id")
      if (saved) setDeviceId(saved)
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem("mcu_device_id", deviceId)
    } catch {
      // ignore
    }
  }, [deviceId])

  const loadCheckpoints = React.useCallback(async () => {
    const res = await fetch("/api/mcu/checkpoints", { cache: "no-store" })
    const json = await res.json()
    if (!res.ok || !json.ok) throw new Error(json?.message ?? "Failed")
    setCheckpoints((json.checkpoints ?? []) as Checkpoint[])
  }, [])

  const loadStatus = React.useCallback(
    async (nikValue: string) => {
      const trimmed = nikValue.trim()
      if (!trimmed) return
      setStatusLoading(true)
      try {
        const url = new URL("/api/mcu/status", window.location.origin)
        url.searchParams.set("nik", trimmed)
        url.searchParams.set("year", String(year))
        const res = await fetch(url.toString(), { cache: "no-store" })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json?.message ?? "Failed")
        setStatus({
          participant: json.participant,
          session: json.session,
          checkpoints: json.checkpoints ?? [],
        })
      } catch (e: any) {
        setError(String(e?.message ?? e))
      } finally {
        setStatusLoading(false)
      }
    },
    [year]
  )

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadCheckpoints()
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadCheckpoints])

  const onScan = async () => {
    const trimmedNik = nik.trim()
    if (!trimmedNik) {
      setError("NIK wajib diisi")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/mcu/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik: trimmedNik,
          checkpointCode,
          year,
          deviceId: deviceId.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.message ?? "Scan failed")

      await loadStatus(trimmedNik)

      // Ready for next scan
      setNik("")
      requestAnimationFrame(() => {
        const el = document.getElementById("nik-input") as HTMLInputElement | null
        el?.focus()
      })
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  const currentStatus = React.useMemo(() => {
    if (!status?.checkpoints?.length) return null
    return status.checkpoints.find((c) => c.code === checkpointCode) ?? null
  }, [status, checkpointCode])

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Kiosk Checkpoint: {currentCheckpoint?.sequence ?? "?"}.{" "}
            {currentCheckpoint?.name ?? checkpointCode}
          </CardTitle>
          <CardDescription>
            Mode operator: cukup scan NIK, sistem otomatis catat ke checkpoint ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkpoints.length ? (
            <div className="flex flex-wrap gap-2">
              {checkpoints.map((c) => (
                <Button
                  key={c.code}
                  asChild
                  variant={c.code === checkpointCode ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={`/mcu/${encodeURIComponent(c.code)}`}>
                    {c.sequence}. {c.name}
                  </Link>
                </Button>
              ))}
              <Button asChild variant="ghost" size="sm">
                <Link href="/mcu">Mode manual</Link>
              </Button>
            </div>
          ) : null}

          {!currentCheckpoint && checkpoints.length ? (
            <div className="text-sm text-red-600">
              Checkpoint tidak ditemukan: {checkpointCode}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">NIK</div>
              <Input
                id="nik-input"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Scan / ketik NIK"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onScan()
                }}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Tahun MCU</div>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Device ID (opsional)</div>
              <Input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="kiosk-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onScan} disabled={loading || !currentCheckpoint}>
              {loading ? "Scanning..." : "Scan / Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => loadStatus(nik)}
              disabled={statusLoading}
            >
              {statusLoading ? "Loading..." : "Refresh Status"}
            </Button>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          {currentStatus ? (
            <div className="text-sm text-muted-foreground">
              Last scan checkpoint ini: {formatDateTime(currentStatus.lastScannedAt)}
              {" · "}count: {currentStatus.scanCount}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Peserta (NIK terakhir)</CardTitle>
          <CardDescription>
            Setelah scan, status semua checkpoint akan terlihat di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!status?.participant ? (
            <div className="text-sm text-muted-foreground">
              Scan NIK untuk mulai melihat status.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Checkpoint</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Last Scan</th>
                    <th className="py-2 pr-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(status.checkpoints ?? []).map((c) => (
                    <tr
                      key={c.code}
                      className={
                        "border-b " +
                        (c.code === checkpointCode ? "bg-muted/40" : "")
                      }
                    >
                      <td className="py-2 pr-3">{c.sequence}</td>
                      <td className="py-2 pr-3">{c.name}</td>
                      <td className="py-2 pr-3">
                        {c.status === "pending" ? "Pending" : "Arrived"}
                      </td>
                      <td className="py-2 pr-3">{formatDateTime(c.lastScannedAt)}</td>
                      <td className="py-2 pr-3">{c.scanCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
