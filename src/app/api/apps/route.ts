import { createApplication } from "@/server/apps/service"
import { privateJson, requireApiOwner } from "@/server/http"
export async function POST(request: Request) { const owner = await requireApiOwner(request, true); if (owner.error) return owner.error; try { return privateJson(await createApplication(await request.json()), { status: 201 }) } catch { return privateJson({ error: "Application configuration is invalid." }, { status: 400 }) } }
