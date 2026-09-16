"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, AppWindow, BookOpen, LogOut, Settings } from "lucide-react"
const links = [{ href: "/applications", label: "Applications", Icon: AppWindow }, { href: "/activity", label: "Activity", Icon: Activity }, { href: "/settings", label: "Settings", Icon: Settings }, { href: "/style-guide", label: "Style guide", Icon: BookOpen }]
export function PortalSidebar({ unread }: { unread: number }) { const pathname = usePathname(); return <aside className="portal-sidebar"><div className="portal-brand"><strong>Operations</strong><span>Private portal</span></div><nav className="portal-nav" aria-label="Portal navigation">{links.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={20}/>{label}{label === "Activity" && unread > 0 ? <b className="nav-count">{unread}</b> : null}</Link>)}</nav><form action="/api/auth/sign-out" method="post" className="portal-signout"><button type="submit"><LogOut size={18}/>Sign out</button></form></aside> }
