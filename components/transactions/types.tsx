export type Sorting = 'added'

export interface TransactionResponse {
  uuid: string
  user: string
  account: string
  accountDetails: any
  amount: number
  spentInCurrencies: any
  currency: string
  currencyDetails: any
  budget: string
  budgetDetails: any
  category: string
  categoryDetails: any
  description: string
  transactionDate: string
  createdAt: string
  modifiedAt: string
}

export interface TransactionBulkResponse extends TransactionResponse {
  rowId: number
}

export interface TransactionsReportResponse {
  day: number
  groupedAmount: number
  month: string
}

export interface AccountUsage {
  spent: number
  income: number
}
