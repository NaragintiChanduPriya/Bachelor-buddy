import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Client-side session state. The authoritative onboarding flag lives on the server (`/me`);
 * this mirrors it so the route guard can decide without flashing the wrong screen.
 */
interface SessionState {
  onboarded: boolean
  setOnboarded: (onboarded: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      onboarded: false,
      setOnboarded: (onboarded) => set({ onboarded }),
      reset: () => set({ onboarded: false }),
    }),
    { name: 'bb-session' },
  ),
)
