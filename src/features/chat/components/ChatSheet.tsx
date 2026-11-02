import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageCircleHeart, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChatPanel } from './ChatPanel'
import { useUiStore } from '@/store/uiStore'

/**
 * Floating "Ask Buddy" button plus the panel it opens: a side sheet on desktop, a bottom
 * sheet on mobile. Hidden on /chat itself, where the full page already shows the same panel.
 */
export function ChatSheet() {
  const open = useUiStore((s) => s.chatSheetOpen)
  const setOpen = useUiStore((s) => s.setChatSheetOpen)
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const onChatPage = pathname === '/chat'

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      clearTimeout(focusTimer)
    }
  }, [open, setOpen])

  // Navigating away closes the sheet, so it never lingers over an unrelated page.
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  if (onChatPage) return null

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label="Ask Buddy"
        aria-expanded={open}
        className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg lg:bottom-6 lg:right-6"
      >
        <MessageCircleHeart className="size-6" aria-hidden="true" />
      </Button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
              <motion.div
                className="absolute inset-0 bg-black/50"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Ask Buddy"
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                className="relative z-10 flex h-[85dvh] w-full flex-col rounded-t-2xl border border-border bg-background p-4 shadow-xl sm:h-dvh sm:max-w-md sm:rounded-none sm:rounded-l-2xl"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Ask Buddy</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <ChatPanel className="min-h-0 flex-1" />
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
