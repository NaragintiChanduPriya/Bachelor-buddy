import { motion, useReducedMotion } from 'framer-motion'
import type { ChatMessage } from '@/types/chat'
import { AgentBadge } from '@/components/AgentBadge'
import { ChatCardRenderer } from './ChatCardRenderer'
import { cn } from '@/utils/cn'

export interface ChatMessageItemProps {
  message: ChatMessage
  onFollowUp: (text: string) => void
}

export function ChatMessageItem({ message, onFollowUp }: ChatMessageItemProps) {
  const reduceMotion = useReducedMotion()
  const isUser = message.role === 'user'

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'rounded-tr-sm bg-primary text-primary-foreground'
            : 'rounded-tl-sm border border-border bg-card',
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      {!isUser && message.steps.length > 0 ? (
        <details className="max-w-[85%] text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            How Buddy worked this out
          </summary>
          <ol className="mt-1.5 list-inside list-decimal space-y-0.5 pl-1">
            {message.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
      ) : null}

      {message.cards.length > 0 ? (
        <ul className="w-full max-w-[85%] space-y-2">
          {message.cards.map((card, index) => (
            <li key={`${message.id}_card_${index}`}>
              <ChatCardRenderer card={card} />
            </li>
          ))}
        </ul>
      ) : null}

      {!isUser && message.agentsUsed.length > 0 ? (
        <div className="flex max-w-[85%] flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Agents used:</span>
          {message.agentsUsed.map((agent) => (
            <AgentBadge key={agent} agent={agent} />
          ))}
        </div>
      ) : null}

      {!isUser && message.suggestedFollowUps.length > 0 ? (
        <ul className="flex max-w-[90%] flex-wrap gap-2 pt-1">
          {message.suggestedFollowUps.map((followUp) => (
            <li key={followUp}>
              <button
                type="button"
                onClick={() => onFollowUp(followUp)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:bg-accent"
              >
                {followUp}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </motion.li>
  )
}
