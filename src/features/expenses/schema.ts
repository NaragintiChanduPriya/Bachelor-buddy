import { z } from 'zod'

export const expenseFormSchema = z.object({
  category: z.enum(['rent', 'food', 'groceries', 'shopping', 'travel', 'bills', 'misc', 'savings'], {
    message: 'Choose a category.',
  }),
  title: z
    .string()
    .trim()
    .min(2, 'Give it a short title, like "Lunch at the mess".')
    .max(80, 'Keep the title under 80 characters.'),
  amount: z
    .number({ message: 'Enter the amount in rupees.' })
    .int('Enter whole rupees, no paise.')
    .positive('The amount must be more than zero.')
    .max(1000000, 'That looks too large. Enter the amount in rupees.'),
  merchant: z.string().trim().max(60, 'Keep this under 60 characters.').optional(),
  note: z.string().trim().max(200, 'Keep the note under 200 characters.').optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>
