import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { ChatPanel } from '@/features/chat/components/ChatPanel'

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col gap-4 lg:h-[calc(100dvh-8rem)]">
      <SeoTitle title="Ask Buddy" description="Ask your agents anything about your money." />
      <PageHeader
        title="Ask Buddy"
        description="Your agents know your budget, your areas and what you have spent."
      />
      <ChatPanel className="min-h-0 flex-1" />
    </div>
  )
}
