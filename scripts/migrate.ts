import fs from "node:fs"
import path from "node:path"
import { config } from "@/server/config"
import { sqlite } from "@/server/db"

const migrationsDirectory = path.join(process.cwd(), "drizzle")
sqlite.exec("CREATE TABLE IF NOT EXISTS __operations_migrations (id TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL)")
for (const file of fs.readdirSync(migrationsDirectory).filter((entry) => entry.endsWith(".sql")).sort()) {
  const applied = sqlite.prepare("SELECT id FROM __operations_migrations WHERE id = ?").get(file)
  if (applied) continue
  const statements = fs.readFileSync(path.join(migrationsDirectory, file), "utf8").split("--> statement-breakpoint").map((statement) => statement.trim()).filter(Boolean)
  sqlite.transaction(() => {
    for (const statement of statements) sqlite.exec(statement)
    sqlite.prepare("INSERT INTO __operations_migrations (id, applied_at) VALUES (?, ?)").run(file, Date.now())
  })()
  console.log(`Applied ${file} to ${config.databasePath}`)
}
