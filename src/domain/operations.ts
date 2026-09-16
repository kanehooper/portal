import type { HealthStatus } from "@/design-system/status-styles"

export const healthResults = ["pass", "fail", "unknown", "configuration"] as const
export type HealthResult = (typeof healthResults)[number]
export type IntendedState = "running" | "stopped"
export type CommandAction = "start" | "stop" | "restart" | "check" | "pause-recovery" | "resume-recovery" | "retry"
export type CommandState = "queued" | "running" | "verifying" | "succeeded" | "failed" | "cancelled" | "expired"

export type AppViewModel = { id: string; displayName: string; icon: string; pm2Name: string; hostname: string | null; port: number | null; intendedState: IntendedState; autoRecovery: boolean; recoveryPausedUntil: string | null; status: HealthStatus; diagnosis: string | null; process: HealthResult; local: HealthResult; public: HealthResult; localLatencyMs: number | null; memoryBytes: number | null; uptimeSince: string | null; lastCheckedAt: string | null; localFailureCount: number; publicFailureCount: number; recoveryBlocked: string | null }

export type ProbeResult = { result: HealthResult; statusCode: number | null; latencyMs: number | null; reason: string | null; sampledAt: Date }

export type StatusInput = { intendedState: IntendedState; process: HealthResult; local: HealthResult; public: HealthResult; lastCheckedAt: Date | null; now?: Date; staleAfterMs?: number; activeOperation?: "starting" | "recovering" | null; recoveryBlocked?: string | null }

export function deriveAppStatus(input: StatusInput): HealthStatus {
  const now = input.now ?? new Date()
  const staleAfterMs = input.staleAfterMs ?? 150_000
  if (!input.lastCheckedAt || now.getTime() - input.lastCheckedAt.getTime() > staleAfterMs) return "unknown"
  if (input.intendedState === "stopped" && input.process === "pass") return "stopped"
  if (input.activeOperation === "starting") return "starting"
  if (input.activeOperation === "recovering") return "recovering"
  if (input.recoveryBlocked || input.process === "fail" || input.local === "fail") return "failed"
  if (input.local === "pass" && input.public === "fail") return "public-unavailable"
  if (input.process === "pass" && input.local === "pass" && input.public === "pass") return "healthy"
  return "unknown"
}

export function isEligibleLocalFailure(result: ProbeResult) {
  return result.result === "fail" && ["timeout", "connection-refused", "liveness-failed"].includes(result.reason ?? "")
}

export function canAttemptRecovery(attempts: readonly Date[], now = new Date()) {
  const recent = attempts.filter((attempt) => now.getTime() - attempt.getTime() < 15 * 60_000)
  const latest = recent.at(-1)
  return recent.length < 3 && (!latest || now.getTime() - latest.getTime() >= 60_000)
}
