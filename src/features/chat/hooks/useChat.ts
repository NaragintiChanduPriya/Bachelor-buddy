import { useCallback, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/lib/api/services/chat'
import { budgetKeys, expenseKeys } from '@/lib/api/queryKeys'
import type { ChatMessage } from '@/types/chat'

let messageCounter = 0
function localId(prefix: string) {
  messageCounter += 1
  return `${prefix}_local_${messageCounter}`
}

/**
 * Chat is conversation state, not cached server data, so the transcript lives in component
 * state and only the send itself is a mutation.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const conversationId = useRef<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (message: string) =>
      chatService.send({ message, conversationId: conversationId.current }),
    onSuccess: (reply) => {
      conversationId.current = reply.conversationId
      setMessages((prev) => [
        ...prev,
        {
          id: reply.messageId,
          role: 'assistant',
          text: reply.text,
          cards: reply.cards,
          agentsUsed: reply.agentsUsed,
          steps: reply.steps,
          suggestedFollowUps: reply.suggestedFollowUps,
          createdAt: reply.createdAt,
        },
      ])
      // Agents read live budget data, so keep those views in step with what was quoted.
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || mutation.isPending) return

      setMessages((prev) => [
        ...prev,
        {
          id: localId('msg'),
          role: 'user',
          text: trimmed,
          cards: [],
          agentsUsed: [],
          steps: [],
          suggestedFollowUps: [],
          createdAt: new Date().toISOString(),
        },
      ])
      mutation.mutate(trimmed)
    },
    [mutation],
  )

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) mutation.mutate(lastUser.text)
  }, [messages, mutation])

  return {
    messages,
    send,
    retry,
    isThinking: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
