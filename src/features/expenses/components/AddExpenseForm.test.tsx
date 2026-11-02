import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { AddExpenseForm } from './AddExpenseForm'

const server = setupServer()

beforeEach(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  server.close()
})

function okResponse() {
  return HttpResponse.json({
    success: true,
    data: {
      expense: {
        id: 'exp_9001',
        category: 'food',
        categoryLabel: 'Food',
        title: 'Lunch at the mess',
        note: null,
        amount: 120,
        merchant: null,
        source: 'manual',
        spentAt: '2026-10-15T07:00:00.000Z',
        createdAt: '2026-10-15T07:00:00.000Z',
      },
      category: {
        id: 'food',
        label: 'Food',
        limit: 7500,
        spent: 5370,
        remaining: 2130,
        percentUsed: 72,
        status: 'warning',
      },
    },
    meta: null,
    error: null,
  })
}

describe('AddExpenseForm', () => {
  it('submits a valid expense and reports success', async () => {
    const user = userEvent.setup()
    let received: unknown = null
    server.use(
      http.post('*/expenses', async ({ request }) => {
        received = await request.json()
        return okResponse()
      }),
    )
    const onSuccess = vi.fn()
    renderWithProviders(<AddExpenseForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('What was it?'), 'Lunch at the mess')
    await user.type(screen.getByLabelText(/Amount/), '120')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(received).toMatchObject({ category: 'food', title: 'Lunch at the mess', amount: 120 })
  })

  it('blocks submission when the title is missing', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<AddExpenseForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/Amount/), '120')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(await screen.findByText(/short title/i)).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('rejects a zero or negative amount', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddExpenseForm />)

    await user.type(screen.getByLabelText('What was it?'), 'Coffee')
    await user.type(screen.getByLabelText(/Amount/), '0')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(await screen.findByText(/more than zero/i)).toBeInTheDocument()
  })

  it('rejects paise, since money is whole rupees', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddExpenseForm />)

    await user.type(screen.getByLabelText('What was it?'), 'Coffee')
    await user.type(screen.getByLabelText(/Amount/), '12.50')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(await screen.findByText(/whole rupees/i)).toBeInTheDocument()
  })

  it('surfaces a server error to the user', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/expenses', () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            meta: null,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'You cannot log an expense in the future.',
              details: null,
            },
          },
          { status: 422 },
        ),
      ),
    )
    renderWithProviders(<AddExpenseForm />)

    await user.type(screen.getByLabelText('What was it?'), 'Dinner')
    await user.type(screen.getByLabelText(/Amount/), '300')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(
      await screen.findByText('You cannot log an expense in the future.'),
    ).toBeInTheDocument()
  })
})
