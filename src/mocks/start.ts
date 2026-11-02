import { restoreDb } from './db'
import { isMockMode } from '@/lib/env'

/** Starts MSW before the app renders. Also runs in a production build for demo hosting. */
export async function startMockServer(): Promise<void> {
  if (!isMockMode()) return

  restoreDb()
  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}
