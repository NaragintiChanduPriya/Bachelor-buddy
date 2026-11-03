import { SeoTitle } from '@/components/SeoTitle'
import { PageHeader } from '@/components/PageHeader'
import { ChatPanel } from '@/features/chat/components/ChatPanel'

/** Ask Buddy lives here and only here — directly on the page, with no extra container. */
export default function ChatPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-12rem)] w-full max-w-3xl flex-col gap-4 lg:h-[calc(100dvh-9.5rem)]">
      <SeoTitle title="Ask Buddy" description="Ask your agents anything about your money." />
      <PageHeader
        title="Ask Buddy"
        description="Your agents know your budget, your areas and what you have spent."
      />
      <ChatPanel className="min-h-0 flex-1" />
    </div>
  )
}
