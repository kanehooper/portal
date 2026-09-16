import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { config } from "@/server/config"
import * as schema from "./schema"

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true, mode: 0o700 })
const sqlite = new Database(config.databasePath)
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")
sqlite.pragma("busy_timeout = 5000")
export const db = drizzle(sqlite, { schema })
export { sqlite }
