import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { config } from "@/server/config"
import { db } from "@/server/db"
import { schema } from "@/server/db/schema"

export const auth = betterAuth({
  appName: "Operations Portal",
  baseURL: config.portalOrigin,
  secret: config.authSecret,
  database: drizzleAdapter(db, { provider: "sqlite", schema, camelCase: true, transaction: true }),
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 14, maxPasswordLength: 128 },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60 * 15, max: 10 },
  trustedOrigins: [config.portalOrigin, "https://portal.thehoopers.au"],
  advanced: { defaultCookieAttributes: { httpOnly: true, secure: config.portalOrigin.startsWith("https://"), sameSite: "lax" } },
  plugins: [nextCookies()],
})

export async function getOwnerSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (config.ownerEmail && session.user.email.toLowerCase() !== config.ownerEmail)) return null
  return session
}

export async function requireOwner() {
  const session = await getOwnerSession()
  if (!session) redirect("/login")
  return session
}

export function isTrustedMutation(request: Request) {
  const origin = request.headers.get("origin")
  return Boolean(origin && [config.portalOrigin, "https://portal.thehoopers.au"].includes(origin))
}
