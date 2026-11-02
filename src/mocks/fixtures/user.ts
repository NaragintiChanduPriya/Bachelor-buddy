import type { User } from '@/types/user'
import { daysAgo } from '../clock'

/** The demo user from the brief: Arjun, 24, software engineer in Bangalore. */
export const demoUser: User = {
  id: 'user_001',
  name: 'Arjun',
  email: 'arjun@example.com',
  age: 24,
  occupation: 'Software Engineer',
  avatarInitials: 'A',
  onboarded: false,
  joinedAt: daysAgo(180),
  preferences: {
    salary: 40000,
    savingsGoal: 8000,
    homeAreaId: 'area_hsr',
    homeAreaName: 'HSR Layout',
    officeAreaId: 'area_bellandur',
    officeAreaName: 'Bellandur',
    techParkId: 'park_orbit',
    techParkName: 'Orbit Tech Campus',
    foodPreference: 'veg',
    cards: [
      { id: 'card_hdfc_cc', bank: 'HDFC', type: 'credit', label: 'HDFC Credit Card' },
      { id: 'card_sbi_dc', bank: 'SBI', type: 'debit', label: 'SBI Debit Card' },
      { id: 'card_icici_cc', bank: 'ICICI', type: 'credit', label: 'ICICI Credit Card' },
      { id: 'card_axis_dc', bank: 'Axis', type: 'debit', label: 'Axis Debit Card' },
    ],
  },
}
