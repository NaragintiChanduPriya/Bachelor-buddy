import type { SavedCard } from '@/types/user'

/** Cards a user can pick during signup. Real bank names are factual and allowed. */
export const availableCards: SavedCard[] = [
  { id: 'card_hdfc_cc', bank: 'HDFC', type: 'credit', label: 'HDFC Credit Card' },
  { id: 'card_hdfc_dc', bank: 'HDFC', type: 'debit', label: 'HDFC Debit Card' },
  { id: 'card_sbi_cc', bank: 'SBI', type: 'credit', label: 'SBI Credit Card' },
  { id: 'card_sbi_dc', bank: 'SBI', type: 'debit', label: 'SBI Debit Card' },
  { id: 'card_icici_cc', bank: 'ICICI', type: 'credit', label: 'ICICI Credit Card' },
  { id: 'card_icici_dc', bank: 'ICICI', type: 'debit', label: 'ICICI Debit Card' },
  { id: 'card_axis_cc', bank: 'Axis', type: 'credit', label: 'Axis Credit Card' },
  { id: 'card_axis_dc', bank: 'Axis', type: 'debit', label: 'Axis Debit Card' },
]

export const foodPreferenceOptions = [
  { value: 'veg', label: 'Vegetarian', hint: 'Only vegetarian places and dishes' },
  { value: 'eggetarian', label: 'Eggetarian', hint: 'Vegetarian plus egg dishes' },
  { value: 'nonVeg', label: 'Non-vegetarian', hint: 'Everything, no restrictions' },
  { value: 'vegan', label: 'Vegan', hint: 'No dairy, no egg, no honey' },
] as const
