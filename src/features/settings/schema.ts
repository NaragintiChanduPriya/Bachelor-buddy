import { z } from 'zod'

const rupees = (field: string) =>
  z
    .number({ message: `Enter your ${field} in rupees.` })
    .int('Enter a whole rupee amount, no paise.')
    .nonnegative('That cannot be negative.')

/** Mirrors the server's PUT /me/preferences validation, so most mistakes never leave the form. */
export const settingsSchema = z
  .object({
    salary: rupees('monthly salary').min(5000, 'Enter a salary of at least ₹5,000.'),
    savingsGoal: rupees('savings goal'),
    homeAreaId: z.string().min(1, 'Choose the area you live in.'),
    officeAreaId: z.string().min(1, 'Choose the area you work in.'),
    techParkId: z.string(),
    foodPreference: z.enum(['veg', 'nonVeg', 'eggetarian', 'vegan'], {
      message: 'Choose a food preference.',
    }),
    cardIds: z.array(z.string()),
  })
  .refine((data) => data.savingsGoal < data.salary, {
    message: 'Your savings goal must be less than your salary.',
    path: ['savingsGoal'],
  })

export type SettingsValues = z.infer<typeof settingsSchema>
