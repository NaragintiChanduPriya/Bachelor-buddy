import { apiPost } from '../client'
import type { ChatMessageRequest, ChatReply } from '@/types/chat'

export const chatService = {
  send: (payload: ChatMessageRequest) => apiPost<ChatReply>('/chat/messages', payload),
}
