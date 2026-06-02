import { AccountKind } from '@/components/accounts/types'

export type Sorting = 'added'

export interface AccountDetails {
  title: string
  kind: AccountKind
}

export interface CurrencyDetails {
  sign: string
}

export interface TransactionResponse {
  uuid: string
  user: string
  account: string
  accountDetails: AccountDetails
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

export interface TransferResponse {
  uuid: string
  user: string
  fromAccount: string
  fromAccountDetails: AccountDetails
  toAccount: string
  toAccountDetails: AccountDetails
  currency: string
  currencyDetails: CurrencyDetails
  amount: number
  description: string
  transferDate: string
  createdAt: string
  modifiedAt: string
}

export interface TransferCreatePayload {
  fromAccount: string
  toAccount: string
  currency: string
  amount: number
  description?: string
  transferDate: string
}
