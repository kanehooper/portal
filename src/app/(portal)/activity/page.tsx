import { desc } from "drizzle-orm"
import { PageContainer } from "@/components/layout/page-container"
import { PageContent } from "@/components/layout/page-content"
import { PageHeader } from "@/components/layout/page-header"
import { db } from "@/server/db"
import { activity } from "@/server/db/schema"
export const dynamic = "force-dynamic"
export default async function ActivityPage() { const events = await db.select().from(activity).orderBy(desc(activity.createdAt)).limit(100); return <PageContainer><PageHeader title="Activity" description="Failures, recoveries and portal actions"/><PageContent><section className="guide-card activity-list">{events.length ? events.map((event) => <article key={event.id}><span className={`activity-severity ${event.severity}`}/><div><strong>{event.summary}</strong><p>{event.source} · {event.createdAt.toLocaleString("en-AU", { timeZone: "Australia/Melbourne" })}</p></div><span>{event.outcome ?? "Recorded"}</span></article>) : <div className="empty-state"><h2 className="type-card-title">No activity yet</h2><p>Imported applications and worker observations will appear here.</p></div>}</section></PageContent></PageContainer> }
