import pm2 from "pm2"
import { config } from "@/server/config"

export type Pm2Process = { name: string; namespace?: string; pmId?: number; pid?: number; status?: string; pmExecPath?: string; pmCwd?: string; args?: string[]; env?: Record<string, string | undefined>; memory?: number; pmUptime?: number; restartTime?: number }

function withPm2<T>(operation: (client: typeof pm2) => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    pm2.connect(true, async (error) => {
      if (error) return reject(error)
      try { resolve(await operation(pm2)) } catch (cause) { reject(cause) } finally { pm2.disconnect() }
    })
  })
}

export async function listPm2Processes(): Promise<Pm2Process[]> {
  return withPm2((client) => new Promise((resolve, reject) => client.list((error, list) => error ? reject(error) : resolve(list.map((item) => { const env = item.pm2_env as unknown as Record<string, unknown>; return { name: item.name ?? "", namespace: typeof env.namespace === "string" ? env.namespace : undefined, pmId: item.pm_id, pid: item.pid, status: item.pm2_env?.status, pmExecPath: item.pm2_env?.pm_exec_path, pmCwd: item.pm2_env?.pm_cwd, args: Array.isArray(env.args) ? env.args as string[] : undefined, env: typeof env.env === "object" && env.env ? env.env as Record<string, string | undefined> : undefined, memory: item.monit?.memory, pmUptime: item.pm2_env?.pm_uptime, restartTime: item.pm2_env?.restart_time } })))))
}

export async function runPm2Action(name: string, action: "start" | "stop" | "restart") {
  return withPm2((client) => new Promise<void>((resolve, reject) => client[action](name, (error) => error ? reject(error) : resolve())))
}

export function detectPort(process: Pm2Process) {
  const args = process.args ?? []
  const portArgument = args.find((argument, index) => (argument === "-p" || argument === "--port") && /^\d+$/.test(args[index + 1] ?? ""))
  if (portArgument) { const index = args.indexOf(portArgument); return { port: Number(args[index + 1]), source: "arguments" as const } }
  const explicit = args.find((argument) => /^--port=\d+$/.test(argument))
  if (explicit) return { port: Number(explicit.slice(7)), source: "arguments" as const }
  const environmentPort = process.env?.PORT
  if (environmentPort && /^\d+$/.test(environmentPort)) return { port: Number(environmentPort), source: "environment" as const }
  return null
}

export const pm2Identity = { home: config.pm2Home, owner: config.pm2Owner }
