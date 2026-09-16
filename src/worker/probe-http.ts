import dns from "node:dns/promises"
import net from "node:net"
import type { ProbeResult } from "@/domain/operations"

const privateRanges = [/^127\./, /^10\./, /^192\.168\./, /^169\.254\./, /^0\./, /^::1$/, /^fc/i, /^fd/i, /^fe80:/i]
function privateAddress(address: string) { return privateRanges.some((pattern) => pattern.test(address)) }

export async function probeHealth(target: URL, allowedLoopback = false): Promise<ProbeResult> {
  if (target.protocol !== "http:" && target.protocol !== "https:") return { result: "configuration", statusCode: null, latencyMs: null, reason: "unsupported-protocol", sampledAt: new Date() }
  const lookup = await dns.lookup(target.hostname, { all: true }).catch(() => [])
  if (!lookup.length || lookup.some((record) => privateAddress(record.address) && !(allowedLoopback && net.isIP(record.address)))) return { result: "configuration", statusCode: null, latencyMs: null, reason: "untrusted-target", sampledAt: new Date() }
  const started = performance.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)
  try {
    const request = new URL(target); request.searchParams.set("probe", crypto.randomUUID())
    const response = await fetch(request, { signal: controller.signal, redirect: "manual", headers: { "cache-control": "no-cache", pragma: "no-cache" } })
    const latencyMs = Math.round(performance.now() - started)
    const body = await response.text().then((value) => value.slice(0, 16 * 1024))
    if (response.status !== 200) return { result: "configuration", statusCode: response.status, latencyMs, reason: "unexpected-status", sampledAt: new Date() }
    try { const parsed = JSON.parse(body); return parsed.status === "ok" ? { result: "pass", statusCode: 200, latencyMs, reason: null, sampledAt: new Date() } : { result: "configuration", statusCode: 200, latencyMs, reason: "unexpected-body", sampledAt: new Date() } } catch { return { result: "configuration", statusCode: 200, latencyMs, reason: "unexpected-body", sampledAt: new Date() } }
  } catch (error) { return { result: "fail", statusCode: null, latencyMs: null, reason: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "connection-refused", sampledAt: new Date() } } finally { clearTimeout(timeout) }
}
