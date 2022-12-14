export type Sorting = 'added'

export interface TransactionResponse {
  uuid: string
  user: string
  account: string
  accountDetails: any
  amount: number
  spentInBaseCurrency: number
  spentInCurrencies: any
  currency: string
  budget: string
  budgetDetails: any
  category: string
  categoryDetails: any
  description: string
  transactionDate: string
  createdAt: string
  modifiedAt: string
}
