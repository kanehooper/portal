import { notFound } from "next/navigation"
import { ApplicationsClient } from "@/components/portal/applications-client"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { PageContent } from "@/components/layout/page-content"
import { layoutSnapshot } from "../../../tests/fixtures/applications"

export const dynamic = "force-dynamic"

// Synthetic data only. This route is unavailable in production, even if the flag is set.
export default function LayoutFixture() {
  if (process.env.NODE_ENV !== "development" || process.env.LAYOUT_TEST_MODE !== "1") notFound()
  return <div className="portal"><PortalSidebar unread={3} /><main className="portal-main">
    <PageContainer fluid>
      <PageHeader title="Applications" description="Monitor and manage your applications" />
      <PageContent><ApplicationsClient initial={layoutSnapshot} preview /></PageContent>
    </PageContainer>
  </main></div>
}
