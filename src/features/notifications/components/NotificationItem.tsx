import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'
import type { AgentNotification } from '@/types/notification'
import { AgentBadge } from '@/components/AgentBadge'
import { Button } from '@/components/ui/button'
import { notificationKinds } from '../notificationKinds'
import { formatDateTime, formatRelative } from '@/utils/date'
import { cn } from '@/utils/cn'

export interface NotificationItemProps {
  notification: AgentNotification
  now: Date
  onMarkRead: (id: string) => void
  marking: boolean
}

export function NotificationItem({ notification, now, onMarkRead, marking }: NotificationItemProps) {
  const navigate = useNavigate()
  const kind = notificationKinds[notification.kind]
  const Icon = kind.icon
  const unread = !notification.read

  // Following a deep link counts as reading the alert.
  const open = () => {
    if (unread) onMarkRead(notification.id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <article
      className={cn(
        'relative flex gap-3 rounded-xl border p-4 transition-colors sm:gap-4',
        unread ? 'border-primary/25 bg-primary/[0.04]' : 'border-border bg-card',
      )}
    >
      <span
        className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', kind.className)}
      >
        <Icon className="size-5" aria-hidden="true" />
        <span className="sr-only">{kind.label}</span>
      </span>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <AgentBadge agent={notification.agent} />
          {unread ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              New
            </span>
          ) : null}
          <time
            dateTime={notification.createdAt}
            title={formatDateTime(notification.createdAt)}
            className="ml-auto text-xs text-muted-foreground"
          >
            {formatRelative(notification.createdAt, now)}
          </time>
        </div>

        <h3 className={cn('leading-snug', unread ? 'font-semibold' : 'font-medium')}>
          {notification.title}
        </h3>
        <p className="text-sm text-muted-foreground">{notification.body}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {notification.link ? (
            <Button size="sm" variant="outline" onClick={open}>
              View
              <ArrowUpRight aria-hidden="true" />
            </Button>
          ) : null}
          {unread ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkRead(notification.id)}
              disabled={marking}
            >
              <Check aria-hidden="true" />
              Mark as read
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
