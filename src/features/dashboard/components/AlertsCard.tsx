import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import type { AgentNotification } from '@/types/notification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AgentBadge } from '@/components/AgentBadge'
import { EmptyState } from '@/components/EmptyState'
import { formatRelative } from '@/utils/date'
import { cn } from '@/utils/cn'

export interface AlertsCardProps {
  notifications: AgentNotification[]
  /** The mock clock's "now", so relative times match the rest of the demo. */
  now: Date
}

export function AlertsCard({ notifications, now }: AlertsCardProps) {
  const latest = notifications.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
            Latest from your agents
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest.length === 0 ? (
          <EmptyState title="Nothing new" description="Your agents will post updates here." />
        ) : (
          <ul className="space-y-3">
            {latest.map((item) => {
              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <AgentBadge agent={item.agent} />
                    {!item.read ? (
                      <span
                        className="size-1.5 rounded-full bg-primary"
                        aria-label="Unread"
                        role="img"
                      />
                    ) : null}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelative(item.createdAt, now)}
                    </span>
                  </div>
                  <p className={cn('text-sm', !item.read && 'font-medium')}>{item.title}</p>
                </>
              )

              return (
                <li key={item.id}>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className="block space-y-1 rounded-lg p-2 -mx-2 transition-colors hover:bg-accent"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="space-y-1 p-2 -mx-2">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link to="/notifications">See all alerts</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
