import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"
import { PageContent } from "@/components/layout/page-content"
import { PageHeader } from "@/components/layout/page-header"
export default async function LogsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <PageContainer><PageHeader title="Application logs" description="Log streaming is available after the application has a registered PM2 log path."/><PageContent><section className="guide-card"><p>Logs for application {id} are not configured yet.</p><Link className="guide-button outline" href={`/applications?app=${id}`}>Return to application</Link></section></PageContent></PageContainer> }
