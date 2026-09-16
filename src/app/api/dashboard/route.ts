import { dashboardSnapshot } from "@/server/apps/service"
import { privateJson, requireApiOwner } from "@/server/http"
export async function GET(request: Request) { const owner = await requireApiOwner(request); if (owner.error) return owner.error; const url = new URL(request.url); return privateJson(await dashboardSnapshot(url.searchParams.get("q") ?? "", url.searchParams.get("status") ?? undefined)) }
