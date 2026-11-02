import type { BudgetCategorySummary } from './budget'
import type { FoodListingSummary } from './food'
import type { GroceryPlanSummary } from './grocery'
import type { HomeSummary } from './home'
import type { Offer } from './offer'
import type { ProductSummary } from './product'

export type AgentName =
  | 'concierge'
  | 'budget'
  | 'food'
  | 'grocery'
  | 'shopping'
  | 'deals'
  | 'home'
  | 'savings'

export type ChatCard =
  | { type: 'food'; listing: FoodListingSummary }
  | { type: 'product'; product: ProductSummary }
  | { type: 'home'; home: HomeSummary }
  | { type: 'budgetSummary'; budget: BudgetCategorySummary[] }
  | { type: 'offer'; offer: Offer }
  | { type: 'groceryPlan'; plan: GroceryPlanSummary }

export interface ChatReply {
  messageId: string
  conversationId: string
  text: string
  cards: ChatCard[]
  agentsUsed: AgentName[]
  steps: string[]
  suggestedFollowUps: string[]
  createdAt: string
}

export interface ChatMessageRequest {
  message: string
  conversationId?: string | null
}

/** Client-side message record; user turns never have cards. */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  cards: ChatCard[]
  agentsUsed: AgentName[]
  steps: string[]
  suggestedFollowUps: string[]
  createdAt: string
}
