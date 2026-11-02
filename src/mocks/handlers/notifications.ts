import { http } from 'msw'
import { db, persistDb } from '../db'
import { nowISO } from '../clock'
import { notFound, ok, withMockBehaviour } from '../http'

function payload() {
  const items = [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    items,
    unreadCount: items.filter((n) => !n.read).length,
    serverNow: nowISO(),
  }
}

export const notificationHandlers = [
  http.get('*/notifications', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure
    return ok(payload())
  }),

  http.patch('*/notifications/read-all', async () => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    db.notifications = db.notifications.map((n) => ({ ...n, read: true }))
    persistDb()
    return ok(payload())
  }),

  http.patch('*/notifications/:id/read', async ({ params }) => {
    const failure = await withMockBehaviour()
    if (failure) return failure

    const id = String(params.id)
    const found = db.notifications.find((n) => n.id === id)
    if (!found) return notFound('Notification')

    found.read = true
    persistDb()
    return ok(payload())
  }),
]
