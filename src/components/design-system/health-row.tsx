import { CircleCheck, CircleHelp, CircleX } from "lucide-react"
import type { HealthResult } from "@/domain/operations"
const icons = { pass: CircleCheck, fail: CircleX, unknown: CircleHelp, configuration: CircleHelp }
export function HealthRow({ label, result, detail }: { label: string; result: HealthResult; detail: string }) { const Icon = icons[result]; return <div className="health-row"><span><Icon size={16} aria-hidden="true" className={`health-${result}`} />{label}</span><strong className={`health-${result}`}>{detail}</strong></div> }
