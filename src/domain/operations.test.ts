import { describe, expect, it } from "vitest"
import { canAttemptRecovery, deriveAppStatus } from "./operations"
describe("application status", () => {
  const now = new Date("2026-09-15T00:00:00Z")
  it("never claims health from stale samples", () => expect(deriveAppStatus({ intendedState: "running", process: "pass", local: "pass", public: "pass", lastCheckedAt: new Date(now.getTime() - 151_000), now })).toBe("unknown"))
  it("keeps public failure distinct from app failure", () => expect(deriveAppStatus({ intendedState: "running", process: "pass", local: "pass", public: "fail", lastCheckedAt: now, now })).toBe("public-unavailable"))
  it("limits recovery attempts", () => expect(canAttemptRecovery([new Date(now.getTime() - 61_000), new Date(now.getTime() - 122_000), new Date(now.getTime() - 183_000)], now)).toBe(false))
})
