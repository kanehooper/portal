import fs from "node:fs"
import path from "node:path"
import { eq, lte } from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { deriveAppStatus } from "@/domain/operations"
import { config } from "@/server/config"
import { db } from "@/server/db"
import { applications, appStatus, commands, healthSamples, workerState } from "@/server/db/schema"
import { listPm2Processes, runPm2Action } from "./pm2-adapter"
import { probeHealth } from "./probe-http"

const lockPath = path.join(config.dataDirectory, "worker.lock")
let running = false
function writeState(key: string, value: string) { return db.insert(workerState).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({ target: workerState.key, set: { value, updatedAt: new Date() } }) }

async function checkApplications() {
  if (running) return
  running = true
  try {
    const processes = await listPm2Processes().catch(() => [])
    const apps = await db.select().from(applications)
    await Promise.all(Array.from({ length: 5 }, (_, lane) => (async () => { for (const app of apps.filter((_, index) => index % 5 === lane)) {
      const process = processes.find((candidate) => candidate.name === app.pm2Name && (candidate.namespace ?? "") === (app.pm2Namespace ?? ""))
      const localUrl = app.port ? new URL(`http://127.0.0.1:${app.port}${app.healthPath}`) : null
      const publicUrl = app.publicOrigin ? new URL(app.healthPath, app.publicOrigin) : null
      const [local, publicProbe] = await Promise.all([localUrl ? probeHealth(localUrl, true) : Promise.resolve({ result: "unknown" as const, statusCode: null, latencyMs: null, reason: "port-unconfigured", sampledAt: new Date() }), publicUrl ? probeHealth(publicUrl) : Promise.resolve({ result: "unknown" as const, statusCode: null, latencyMs: null, reason: "public-origin-unconfigured", sampledAt: new Date() })])
      const processResult = process?.status === "online" ? "pass" : process ? "fail" : "unknown"
      const now = new Date()
      const previous = await db.select().from(appStatus).where(eq(appStatus.appId, app.id)).limit(1)
      const localFailures = local.result === "fail" ? (previous[0]?.localFailureCount ?? 0) + 1 : 0
      const publicFailures = publicProbe.result === "fail" ? (previous[0]?.publicFailureCount ?? 0) + 1 : 0
      const status = deriveAppStatus({ intendedState: app.intendedState as "running" | "stopped", process: processResult, local: local.result, public: publicProbe.result, lastCheckedAt: now })
      await db.insert(appStatus).values({ appId: app.id, status, processState: process?.status ?? null, localResult: local.result, publicResult: publicProbe.result, localLatencyMs: local.latencyMs, publicLatencyMs: publicProbe.latencyMs, memoryBytes: process?.memory ?? null, uptimeSince: process?.pmUptime ? new Date(process.pmUptime) : null, lastCheckedAt: now, localFailureCount: localFailures, publicFailureCount: publicFailures, updatedAt: now }).onConflictDoUpdate({ target: appStatus.appId, set: { status, processState: process?.status ?? null, localResult: local.result, publicResult: publicProbe.result, localLatencyMs: local.latencyMs, publicLatencyMs: publicProbe.latencyMs, memoryBytes: process?.memory ?? null, uptimeSince: process?.pmUptime ? new Date(process.pmUptime) : null, lastCheckedAt: now, localFailureCount: localFailures, publicFailureCount: publicFailures, updatedAt: now } })
      await db.insert(healthSamples).values([local, publicProbe].map((sample, index) => ({ id: randomUUID(), appId: app.id, kind: index ? "public" : "local", result: sample.result, statusCode: sample.statusCode, latencyMs: sample.latencyMs, reason: sample.reason, sampledAt: sample.sampledAt })))
    } })()))
  } finally { running = false }
}

async function runCommands() {
  const now = new Date()
  await db.update(commands).set({ state: "expired", updatedAt: now }).where(lte(commands.expiresAt, now))
  const queued = await db.select().from(commands).where(eq(commands.state, "queued")).limit(10)
  for (const command of queued) {
    const app = (await db.select().from(applications).where(eq(applications.id, command.targetId)).limit(1))[0]
    if (!app) { await db.update(commands).set({ state: "cancelled", result: "Target no longer exists", updatedAt: new Date() }).where(eq(commands.id, command.id)); continue }
    await db.update(commands).set({ state: "running", claimedAt: new Date(), updatedAt: new Date() }).where(eq(commands.id, command.id))
    try {
      if (["start", "stop", "restart"].includes(command.action)) await runPm2Action(app.pm2Name, command.action as "start" | "stop" | "restart")
      await db.update(commands).set({ state: "succeeded", result: command.action === "check" ? "Check scheduled" : "Action accepted; next observation will verify the outcome.", updatedAt: new Date() }).where(eq(commands.id, command.id))
    } catch { await db.update(commands).set({ state: "failed", result: "The worker could not complete this action.", updatedAt: new Date() }).where(eq(commands.id, command.id)) }
  }
}

async function cycle() { await writeState("heartbeat", new Date().toISOString()); await checkApplications(); await runCommands() }
async function main() { fs.mkdirSync(config.dataDirectory, { recursive: true, mode: 0o700 }); try { const descriptor = fs.openSync(lockPath, "wx", 0o600); fs.writeFileSync(descriptor, `${process.pid}`) } catch { throw new Error("Another Operations worker is already running.") }; await cycle(); setInterval(() => void writeState("heartbeat", new Date().toISOString()), 5_000); setInterval(() => void cycle(), 60_000); process.on("SIGTERM", () => { fs.rmSync(lockPath, { force: true }); process.exit(0) }) }
void main().catch((error) => { console.error(error); process.exit(1) })
