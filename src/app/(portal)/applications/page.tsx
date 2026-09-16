import { ApplicationsClient } from "@/components/portal/applications-client"
import { PageContainer } from "@/components/layout/page-container"
import { PageContent } from "@/components/layout/page-content"
import { PageHeader } from "@/components/layout/page-header"
import { dashboardSnapshot } from "@/server/apps/service"
export const dynamic = "force-dynamic"
export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ app?: string }> }) { const [snapshot, params] = await Promise.all([dashboardSnapshot(), searchParams]); return <PageContainer><PageHeader title="Applications" description="Monitor and manage your applications"/><PageContent><ApplicationsClient initial={snapshot} selectedId={params.app}/></PageContent></PageContainer> }
