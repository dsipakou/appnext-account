
export type RecurrentTypes = 'monthly' | 'weekly'

export interface CurrencyMap {
  [key: string]: number
}

export interface PlannedMap {
  planned: number
  plannedInCurrencies: CurrencyMap
}

export interface SpentMap {
  spentInBaseCurrency: number
  spentInCurrencies: CurrencyMap
  spentInOriginalCurrency: number
}

export interface GroupedByCategoryBudget extends PlannedMap, SpentMap {
  uuid: string
  categoryName: string
  budgets: MonthGroupedBudgetItem[]
}

export interface MonthGroupedBudgetItem {
  uuid: string
  title: string
  items: MonthBudgetItem[]
  planned: number
  spent: number
  isAnotherCategory: boolean
  isAnotherMonth: boolean
  spentInCurrencies: CurrencyMap
  spentInCurrenciesOverall: CurrencyMap
  plannedInCurrencies: CurrencyMap
}

export interface BudgetSlim {
  title: string
}

export interface MonthBudgetItem extends PlannedMap, SpentMap {
  uuid: string
  title: string
  category: string
  user: string
  transactions: TransactionItem[]
  budgetDate: string
  currency: string
  description: string
  recurrent: RecurrentTypes
  isCompleted: boolean
  createdAt: string
  modifiedAt: string
}

export interface WeekBudgetItem extends PlannedMap, SpentMap {
  uuid: string
  title: string
  user: string
  category: string
  currency: string
  transactions: TransactionItem[]
  recurrent: RecurrentTypes
  description: string
  isCompleted: boolean
  budgetDate: string
  createdAt: string
  modifiedAt: string
}

export interface WeekBudgetResponse {
  data: WeekBudgetItem[]
  isLoading: boolean
}

export interface CompactWeekItem {
  uuid: string
  title: string
  user: string
  amount: number
  category: string
  currency: string
  planned: number
  spent: number
  recurrent: RecurrentTypes
  isCompleted: boolean
  budgetDate: string
}

export interface TransactionItem extends SpentMap {
  uuid: string
  currency: string
  currencyCode: string
  transactionDate: string
}

export interface BudgetItem {
  title: string
  amount: string
  currency: string
  user: string
  category: string
  recurrent: RecurrentTypes
  budgetDate: string
  description: string
  isCompleted: boolean
}

export interface DuplicateBudgetResponse {
  uuid: string
  title: string
  date: string
  amount: number
  currency: string
}

export interface MonthSummedUsage {
  month: string
  amount: number
}
