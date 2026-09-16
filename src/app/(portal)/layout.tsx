import type { ReactNode } from "react"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { dashboardSnapshot } from "@/server/apps/service"
import { requireOwner } from "@/server/auth"
export default async function PortalLayout({ children }: { children: ReactNode }) { await requireOwner(); const snapshot = await dashboardSnapshot(); return <div className="portal"><PortalSidebar unread={snapshot.unreadNotifications}/><main className="portal-main">{children}</main></div> }
