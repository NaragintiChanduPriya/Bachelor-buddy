import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ChatMessageItem } from './ChatMessageItem'
import type { ChatMessage } from '@/types/chat'
import type { FoodListingSummary } from '@/types/food'

const listing: FoodListingSummary = {
  id: 'food_003',
  name: 'Annapoorna Mess',
  type: 'mess',
  areaId: 'area_hsr',
  areaName: 'HSR Layout',
  veg: true,
  rating: 4.4,
  reviewCount: 820,
  priceMin: 60,
  priceMax: 120,
  avgMealPrice: 120,
  distanceFromHomeKm: 1.2,
  distanceFromOfficeKm: 4.1,
  tags: ['Unlimited rice'],
  openNow: true,
  timings: '11:30 – 22:00',
  thumbnailSeed: 120,
  sponsored: false,
  monthlyPlanPrice: null,
}

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg_1',
    role: 'assistant',
    text: 'Annapoorna Mess serves full meals at ₹120.',
    cards: [],
    agentsUsed: [],
    steps: [],
    suggestedFollowUps: [],
    createdAt: '2026-10-15T07:00:00.000Z',
    ...overrides,
  }
}

describe('ChatMessageItem', () => {
  it('renders the reply text', () => {
    renderWithProviders(<ChatMessageItem message={message()} onFollowUp={vi.fn()} />)
    expect(screen.getByText('Annapoorna Mess serves full meals at ₹120.')).toBeInTheDocument()
  })

  it('shows which agents answered', () => {
    renderWithProviders(
      <ChatMessageItem
        message={message({ agentsUsed: ['concierge', 'food', 'budget'] })}
        onFollowUp={vi.fn()}
      />,
    )
    expect(screen.getByText('Agents used:')).toBeInTheDocument()
    expect(screen.getByText('Concierge')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
  })

  it('lists the steps the agents took', () => {
    renderWithProviders(
      <ChatMessageItem
        message={message({ steps: ['Checking your budget…', 'Finding meals near Bellandur…'] })}
        onFollowUp={vi.fn()}
      />,
    )
    expect(screen.getByText('Checking your budget…')).toBeInTheDocument()
    expect(screen.getByText('Finding meals near Bellandur…')).toBeInTheDocument()
  })

  it('renders a food card attached to the reply', () => {
    renderWithProviders(
      <ChatMessageItem
        message={message({ cards: [{ type: 'food', listing }] })}
        onFollowUp={vi.fn()}
      />,
    )
    expect(screen.getByRole('link', { name: 'Annapoorna Mess' })).toBeInTheDocument()
    expect(screen.getByText('₹120')).toBeInTheDocument()
  })

  it('renders a budget summary card', () => {
    renderWithProviders(
      <ChatMessageItem
        message={message({
          cards: [
            {
              type: 'budgetSummary',
              budget: [
                {
                  id: 'food',
                  label: 'Food',
                  limit: 7500,
                  spent: 5250,
                  remaining: 2250,
                  percentUsed: 70,
                  status: 'warning',
                },
              ],
            },
          ],
        })}
        onFollowUp={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('progressbar', { name: 'Food: 70% of budget used' }),
    ).toBeInTheDocument()
  })

  it('sends a follow-up when a chip is clicked', async () => {
    const user = userEvent.setup()
    const onFollowUp = vi.fn()
    renderWithProviders(
      <ChatMessageItem
        message={message({ suggestedFollowUps: ['Is delivery cheaper?'] })}
        onFollowUp={onFollowUp}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Is delivery cheaper?' }))
    expect(onFollowUp).toHaveBeenCalledWith('Is delivery cheaper?')
  })

  it('shows no agent badges or follow-ups on the user turn', () => {
    renderWithProviders(
      <ChatMessageItem
        message={message({ role: 'user', text: 'I am hungry', agentsUsed: ['concierge'] })}
        onFollowUp={vi.fn()}
      />,
    )
    expect(screen.getByText('I am hungry')).toBeInTheDocument()
    expect(screen.queryByText('Agents used:')).not.toBeInTheDocument()
  })
})
