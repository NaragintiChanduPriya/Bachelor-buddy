import { useEffect, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ErrorState'
import { ChatMessageItem } from './ChatMessageItem'
import { ThinkingState } from './ThinkingState'
import { useChat } from '../hooks/useChat'
import { cn } from '@/utils/cn'

const starterPrompts = [
  'I have ₹150 and I am hungry near office',
  'Formal shoes under ₹1,500 for an interview on Friday',
  'How much did I spend on food this month?',
  'Cheapest way to buy groceries this month',
  'Find a PG under ₹10,000 near Marathahalli',
  'What offers can I use on my cards?',
]

export function ChatPanel({ className }: { className?: string }) {
  const { messages, send, retry, isThinking, isError, error } = useChat()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isThinking])

  const submit = (text: string) => {
    send(text)
    setDraft('')
    inputRef.current?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter makes a new line.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit(draft)
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
        {messages.length === 0 && !isThinking ? (
          <div className="flex h-full flex-col justify-end gap-3 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Try asking</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => submit(prompt)}
                    className="h-full w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/60"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-4" aria-live="polite" aria-label="Conversation">
            {messages.map((message) => (
              <ChatMessageItem key={message.id} message={message} onFollowUp={submit} />
            ))}
            {isThinking ? (
              <li>
                <ThinkingState />
              </li>
            ) : null}
            {isError ? (
              <li>
                <ErrorState
                  error={error}
                  title="Buddy could not answer that"
                  onRetry={retry}
                  className="max-w-[85%]"
                />
              </li>
            ) : null}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 px-1 pt-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask Buddy a question
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about food, budget, deals or a place to live…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm shadow-card outline-none placeholder:text-muted-foreground focus-visible:border-ring"
        />
        <Button type="submit" size="icon" className="size-11 rounded-xl" disabled={!draft.trim() || isThinking}>
          <SendHorizontal aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <p className="px-1 pt-1.5 text-[11px] text-muted-foreground">
        Enter sends · Shift + Enter for a new line
      </p>
    </div>
  )
}
