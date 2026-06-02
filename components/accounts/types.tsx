export type AccountKind = 'spending' | 'savings'

export interface Account {
  uuid: string
  title: string
  category: string | null
  user: string
  isMain: boolean
  kind: AccountKind
  description: string
}

export interface AccountResponse extends Account {
  createdAt: string
  modifiedAt: string
}

export interface AccountDetailsResponse extends AccountResponse {
  usage: Array<{
    month: string
    spendings: number
    income: number
  }>
}
