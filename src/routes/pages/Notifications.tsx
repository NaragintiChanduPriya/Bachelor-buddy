import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { BellOff, CheckCheck } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications'
import type { AgentNotification } from '@/types/notification'
import { isSameDay } from '@/utils/date'

type View = 'all' | 'unread'

export default function NotificationsPage() {
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'unread' ? 'unread' : 'all'
  const reduceMotion = useReducedMotion()

  const notifications = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('view')
    else nextParams.set('view', next)
    setParams(nextParams, { replace: true })
  }

  const data = notifications.data
  // Group against the server's clock so "Today" matches the rest of the demo.
  const now = data ? new Date(data.serverNow) : new Date()
  const visible = (data?.items ?? []).filter((n) => view === 'all' || !n.read)
  const today = visible.filter((n) => data && isSameDay(n.createdAt, data.serverNow))
  const earlier = visible.filter((n) => !data || !isSameDay(n.createdAt, data.serverNow))

  const groups: Array<{ title: string; items: AgentNotification[] }> = [
    { title: 'Today', items: today },
    { title: 'Earlier', items: earlier },
  ].filter((group) => group.items.length > 0)

  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <SeoTitle title="Alerts" description="Updates from your money agents." />
      <PageHeader
        title="Notifications"
        description={
          data
            ? unreadCount > 0
              ? `${unreadCount} unread from your agents`
              : 'You are all caught up'
            : 'Checking for updates…'
        }
        actions={
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={unreadCount === 0 || markAll.isPending}
          >
            <CheckCheck aria-hidden="true" />
            {markAll.isPending ? 'Marking…' : 'Mark all as read'}
          </Button>
        }
      />

      <Tabs
        label="Which alerts to show"
        items={[
          { value: 'all', label: `All${data ? ` (${data.items.length})` : ''}` },
          { value: 'unread', label: `Unread${data ? ` (${unreadCount})` : ''}` },
        ]}
        value={view}
        onChange={setView}
      />

      {markAll.isError || markRead.isError ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          We could not update that alert. Please try again.
        </p>
      ) : null}

      {notifications.isPending ? (
        <div className="space-y-3" role="status" aria-label="Loading alerts">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : notifications.isError ? (
        <ErrorState
          error={notifications.error}
          title="We could not load your alerts"
          onRetry={() => void notifications.refetch()}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={view === 'unread' ? 'No unread alerts' : 'No alerts yet'}
          description={
            view === 'unread'
              ? 'You have read everything your agents sent. Nice.'
              : 'Your agents will post lunch ideas, price drops and budget warnings here.'
          }
          actionLabel={view === 'unread' ? 'Show all alerts' : undefined}
          onAction={view === 'unread' ? () => setView('all') : undefined}
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.title} aria-labelledby={`group-${group.title}`} className="space-y-3">
              <h2
                id={`group-${group.title}`}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {group.title}
              </h2>
              <ul className="space-y-3">
                {group.items.map((notification, index) => (
                  <motion.li
                    key={notification.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : index * 0.03 }}
                  >
                    <NotificationItem
                      notification={notification}
                      now={now}
                      onMarkRead={(id) => markRead.mutate(id)}
                      marking={markRead.isPending && markRead.variables === notification.id}
                    />
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
