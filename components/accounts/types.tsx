export interface Account {
  uuid: string
  title: string
  category: string | null
  user: string
  isMain: boolean
  description: string
}

export interface AccountResponse extends Account {
  createdAt: string
  modifiedAt: string
}
