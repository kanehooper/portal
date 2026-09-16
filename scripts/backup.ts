import fs from "node:fs"
import path from "node:path"
import { config } from "@/server/config"
import { sqlite } from "@/server/db"
const output = process.argv[2] ?? path.join(config.dataDirectory, "backups")
fs.mkdirSync(output, { recursive: true, mode: 0o700 })
const filename = path.join(output, `operations-${new Date().toISOString().slice(0, 10)}.sqlite`)
sqlite.backup(filename).then(() => { const entries = fs.readdirSync(output).filter((entry) => entry.endsWith(".sqlite")).sort().reverse(); for (const stale of entries.slice(7)) fs.rmSync(path.join(output, stale)); console.log(`Backup written to ${filename}`) }).catch((error) => { console.error(error); process.exit(1) })
