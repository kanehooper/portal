import { asc, desc, eq, like, or, sql } from "drizzle-orm"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import { deriveAppStatus, type AppViewModel, type CommandAction } from "@/domain/operations"
import { db } from "@/server/db"
import { activity, applications, appStatus, commands, notifications } from "@/server/db/schema"

const appInput = z.object({ displayName: z.string().trim().min(1).max(80), icon: z.string().trim().min(1).max(40).default("Box"), pm2Name: z.string().trim().min(1).max(120), pm2Namespace: z.string().trim().max(120).optional().nullable(), scriptPath: z.string().trim().max(1024).optional().nullable(), workingDirectory: z.string().trim().max(1024).optional().nullable(), processIdentity: z.string().trim().min(8).max(512), port: z.number().int().min(1).max(65535).optional().nullable(), portSource: z.enum(["arguments", "environment", "owner-confirmed"]).optional().nullable(), publicOrigin: z.string().url().refine((url) => new URL(url).protocol === "https:", "Public origin must use HTTPS").optional().nullable(), healthPath: z.string().startsWith("/").max(200).default("/api/health"), healthMode: z.enum(["identity", "status-only"]).default("identity"), expectedAppKey: z.string().trim().max(120).optional().nullable(), connectorId: z.string().trim().max(120).optional().nullable(), recipeJson: z.string().max(20_000).optional().nullable() })
export type ApplicationInput = z.infer<typeof appInput>

function toView(row: typeof applications.$inferSelect & { status?: typeof appStatus.$inferSelect | null }): AppViewModel {
  const current = row.status
  const lastCheckedAt = current?.lastCheckedAt ?? null
  const process = (current?.processState === "online" ? "pass" : current?.processState ? "fail" : "unknown") as AppViewModel["process"]
  const local = (current?.localResult ?? "unknown") as AppViewModel["local"]
  const publicResult = (current?.publicResult ?? "unknown") as AppViewModel["public"]
  return { id: row.id, displayName: row.displayName, icon: row.icon, pm2Name: row.pm2Name, hostname: row.publicOrigin ? new URL(row.publicOrigin).hostname : null, port: row.port, intendedState: row.intendedState as AppViewModel["intendedState"], autoRecovery: row.autoRecovery, recoveryPausedUntil: row.recoveryPausedUntil?.toISOString() ?? null, status: deriveAppStatus({ intendedState: row.intendedState as AppViewModel["intendedState"], process, local, public: publicResult, lastCheckedAt, recoveryBlocked: current?.recoveryBlocked ?? undefined }), diagnosis: current?.diagnosis ?? null, process, local, public: publicResult, localLatencyMs: current?.localLatencyMs ?? null, memoryBytes: current?.memoryBytes ?? null, uptimeSince: current?.uptimeSince?.toISOString() ?? null, lastCheckedAt: lastCheckedAt?.toISOString() ?? null, localFailureCount: current?.localFailureCount ?? 0, publicFailureCount: current?.publicFailureCount ?? 0, recoveryBlocked: current?.recoveryBlocked ?? null }
}

export async function listApplications(search = "", status?: string) {
  const query = `%${search.trim()}%`
  const filter = search.trim() ? or(like(applications.displayName, query), like(applications.pm2Name, query), like(applications.publicOrigin, query), sql`CAST(${applications.port} AS TEXT) LIKE ${query}`) : undefined
  const rows = await db.select().from(applications).leftJoin(appStatus, eq(applications.id, appStatus.appId)).where(filter).orderBy(asc(applications.displayName))
  const view = rows.map(({ applications: app, appStatus: current }) => toView({ ...app, status: current }))
  return status ? view.filter((item) => item.status === status) : view
}

export async function getApplication(id: string) {
  const rows = await db.select().from(applications).leftJoin(appStatus, eq(applications.id, appStatus.appId)).where(eq(applications.id, id)).limit(1)
  if (!rows[0]) return null
  return toView({ ...rows[0].applications, status: rows[0].appStatus })
}

export async function createApplication(input: ApplicationInput) {
  const value = appInput.parse(input)
  const now = new Date()
  const id = randomUUID()
  db.transaction((tx) => {
    tx.insert(applications).values({ id, ...value, createdAt: now, updatedAt: now }).run()
    tx.insert(appStatus).values({ appId: id, status: "unknown", updatedAt: now }).run()
    tx.insert(activity).values({ id: randomUUID(), appId: id, type: "application-imported", severity: "info", source: "Owner", summary: `${value.displayName} was added to the portal.`, createdAt: now }).run()
  })
  return getApplication(id)
}

export async function updateApplication(id: string, input: Partial<ApplicationInput>) {
  const current = await db.select().from(applications).where(eq(applications.id, id)).limit(1)
  if (!current[0]) return null
  const value = appInput.parse({ ...current[0], ...input })
  await db.update(applications).set({ ...value, updatedAt: new Date() }).where(eq(applications.id, id))
  return getApplication(id)
}

export async function enqueueAppCommand(appId: string, action: CommandAction, idempotencyKey: string) {
  const app = await getApplication(appId)
  if (!app) return null
  const now = new Date()
  const id = randomUUID()
  db.transaction((tx) => {
    if (action === "stop") tx.update(applications).set({ intendedState: "stopped", updatedAt: now }).where(eq(applications.id, appId)).run()
    if (action === "start") tx.update(applications).set({ intendedState: "running", updatedAt: now }).where(eq(applications.id, appId)).run()
    if (action === "pause-recovery") tx.update(applications).set({ recoveryPausedUntil: new Date(now.getTime() + 60 * 60_000), updatedAt: now }).where(eq(applications.id, appId)).run()
    if (action === "resume-recovery") tx.update(applications).set({ recoveryPausedUntil: null, updatedAt: now }).where(eq(applications.id, appId)).run()
    tx.insert(commands).values({ id, targetType: "application", targetId: appId, action, state: "queued", source: "Owner", idempotencyKey, expiresAt: new Date(now.getTime() + 120_000), createdAt: now, updatedAt: now }).onConflictDoNothing().run()
    tx.insert(activity).values({ id: randomUUID(), appId, type: `command-${action}`, severity: "info", source: "Owner", summary: `${action.replaceAll("-", " ")} requested for ${app.displayName}.`, outcome: "queued", createdAt: now }).run()
  })
  return { id, state: "queued" as const }
}

export async function dashboardSnapshot(search?: string, status?: string) {
  const apps = await listApplications(search, status)
  const latest = await db.select().from(activity).orderBy(desc(activity.createdAt)).limit(20)
  const unread = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(sql`${notifications.readAt} IS NULL`)
  return { applications: apps, activity: latest, unreadNotifications: Number(unread[0]?.count ?? 0), infrastructure: { worker: "unknown", pm2: "unknown", connector: "unknown" } }
}
