import type { AppViewModel } from "../../src/domain/operations"
import { statusPresentation, type HealthStatus } from "../../src/design-system/status-styles"

export const layoutSnapshot = {
  unreadNotifications: 3,
  infrastructure: { worker: "healthy", pm2: "healthy", connector: "unknown" },
  applications: (Object.keys(statusPresentation) as HealthStatus[]).map((status, index): AppViewModel => ({
    id: `fixture-${status}`, displayName: index === 0 ? "Handbook AI" : `Operations international customer knowledge platform ${index}`,
    icon: "AppWindow", pm2Name: `fixture-${index}`, hostname: index === 6 ? null : `knowledge-platform-${index}.example.invalid`,
    port: index === 6 ? null : 4000 + index, intendedState: status === "stopped" ? "stopped" : "running",
    autoRecovery: false, recoveryPausedUntil: null, status, diagnosis: null,
    process: "pass", local: status === "failed" ? "fail" : "pass", public: status === "public-unavailable" ? "fail" : "pass",
    localLatencyMs: 48, memoryBytes: 212 * 1024 * 1024, uptimeSince: "2026-01-01T00:00:00Z",
    lastCheckedAt: "2026-01-01T00:00:00Z", localFailureCount: 0, publicFailureCount: 0, recoveryBlocked: null,
  })),
}
