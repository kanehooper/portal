import { NextResponse } from "next/server"
import { getOwnerSession, isTrustedMutation } from "@/server/auth"

export async function requireApiOwner(request: Request, mutation = false) {
  if (mutation && !isTrustedMutation(request)) return { error: NextResponse.json({ error: "Invalid request origin" }, { status: 403 }) }
  const session = await getOwnerSession()
  if (!session) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) }
  return { session }
}

export function privateJson(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}
