import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from '@/lib/api/queryClient'
import { router } from '@/routes/router'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { DevtoolsGate } from '@/components/DevtoolsGate'

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <DevtoolsGate />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
