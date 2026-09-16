export const dynamic = "force-dynamic"
export function GET() { return Response.json({ status: "ok", app: "operations-portal" }, { headers: { "Cache-Control": "no-store" } }) }
