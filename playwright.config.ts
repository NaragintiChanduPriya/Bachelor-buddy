import { defineConfig, devices } from '@playwright/test'

/**
 * Uses the locally installed Chrome via `channel`, so no extra browser download is needed.
 * Run with: npm run e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4290',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  // Runs against the production build, so the specs exercise what actually ships.
  webServer: {
    command: 'npm run build && npm run preview -- --port 4290 --strictPort',
    url: 'http://localhost:4290',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
