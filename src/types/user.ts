export type FoodPreference = 'veg' | 'nonVeg' | 'eggetarian' | 'vegan'

export type CardType = 'credit' | 'debit'

export interface SavedCard {
  id: string
  bank: string
  type: CardType
  label: string
}

export interface UserPreferences {
  salary: number
  savingsGoal: number
  homeAreaId: string
  homeAreaName: string
  officeAreaId: string
  officeAreaName: string
  techParkId: string | null
  techParkName: string | null
  foodPreference: FoodPreference
  cards: SavedCard[]
}

export interface User {
  id: string
  name: string
  email: string
  age: number
  occupation: string
  avatarInitials: string
  onboarded: boolean
  joinedAt: string
  preferences: UserPreferences
}
