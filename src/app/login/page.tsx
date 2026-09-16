import { redirect } from "next/navigation"
import { LoginForm } from "./login-form"
import { getOwnerSession } from "@/server/auth"
export const dynamic = "force-dynamic"
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) { if (await getOwnerSession()) redirect("/applications"); const callbackUrl = (await searchParams).callbackUrl; const destination = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/applications"; return <main className="login-page"><section className="login-card"><div className="portal-brand"><strong>Operations</strong><span>Private portal</span></div><h1 className="type-page-title">Sign in</h1><p>Use the owner account provisioned for this portal.</p><LoginForm callbackUrl={destination}/></section></main> }
