import { redirect } from "next/navigation"
import { getOwnerSession } from "@/server/auth"
export const dynamic = "force-dynamic"
export default async function Home() { redirect(await getOwnerSession() ? "/applications" : "/login") }
