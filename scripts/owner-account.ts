import { randomUUID } from "node:crypto"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"
import { eq } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto"
import { db } from "@/server/db"
import { account, session, user } from "@/server/db/schema"

async function main() {
  const suppliedEmail = process.argv.find((argument) => argument.startsWith("--email="))?.slice(8)
  const reader = createInterface({ input: stdin, output: stdout, terminal: true })
  const email = (suppliedEmail ?? await reader.question("Owner email: ")).trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("A valid owner email is required.")
  const password = await reader.question("Password (minimum 14 characters): ")
  reader.close()
  if (password.length < 14) throw new Error("Password must contain at least 14 characters.")
  const now = new Date()
  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1)
  const userId = existing[0]?.id ?? randomUUID()
  const passwordHash = await hashPassword(password)
  db.transaction((tx) => {
    if (existing[0]) { tx.update(user).set({ name: "Operations owner", emailVerified: true, updatedAt: now }).where(eq(user.id, userId)).run(); tx.delete(session).where(eq(session.userId, userId)).run(); tx.delete(account).where(eq(account.userId, userId)).run() }
    else tx.insert(user).values({ id: userId, name: "Operations owner", email, emailVerified: true, image: null, createdAt: now, updatedAt: now }).run()
    tx.insert(account).values({ id: randomUUID(), accountId: userId, providerId: "credential", userId, password: passwordHash, createdAt: now, updatedAt: now }).run()
  })
  console.log(`Owner account for ${email} is ready. Existing sessions were revoked.`)
}
void main().catch((error) => { console.error(error); process.exitCode = 1 })
