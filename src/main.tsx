import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startMockServer } from './mocks/start'
import './index.css'

/** MSW must be listening before the first request goes out, so we await it before rendering. */
async function bootstrap() {
  await startMockServer()

  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root was not found')

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
