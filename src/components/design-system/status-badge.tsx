import { CircleAlert, CircleCheck, CircleHelp, CirclePause, LoaderCircle, RefreshCw } from "lucide-react"
import { getStatusPresentation, type HealthStatus } from "@/design-system/status-styles"

const icons = { CircleCheck, RefreshCw, LoaderCircle, CircleAlert, CirclePause, CircleHelp }
export function StatusBadge({ status }: { status: HealthStatus | string }) { const item = getStatusPresentation(status); const Icon = icons[item.icon]; return <span className={`badge status-${item.tone}`}><Icon aria-hidden="true" size={14} className={item.animate ? "animate-spin" : undefined} />{item.label}</span> }
