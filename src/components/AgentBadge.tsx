import type { AgentName } from '@/types/chat'
import { agentMeta } from './agentMeta'
import { cn } from '@/utils/cn'

export interface AgentBadgeProps {
  agent: AgentName
  showLabel?: boolean
  className?: string
}

export function AgentBadge({ agent, showLabel = true, className }: AgentBadgeProps) {
  const meta = agentMeta[agent]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {showLabel ? meta.label : <span className="sr-only">{meta.label}</span>}
    </span>
  )
}
