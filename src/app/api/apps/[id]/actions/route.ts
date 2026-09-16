import { z } from "zod"
import { enqueueAppCommand } from "@/server/apps/service"
import { privateJson, requireApiOwner } from "@/server/http"
const input = z.object({ action: z.enum(["start", "stop", "restart", "check", "pause-recovery", "resume-recovery", "retry"]), idempotencyKey: z.string().uuid() })
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { const owner = await requireApiOwner(request, true); if (owner.error) return owner.error; try { const { action, idempotencyKey } = input.parse(await request.json()); const command = await enqueueAppCommand((await params).id, action, idempotencyKey); return command ? privateJson(command, { status: 202 }) : privateJson({ error: "Not found" }, { status: 404 }) } catch { return privateJson({ error: "Invalid command." }, { status: 400 }) } }
