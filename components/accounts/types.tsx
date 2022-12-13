export interface Account {
  title: string
  category: string | null
  user: string
  isMain: boolean
  description: string
}

export interface AccountResponse extends Account {
  uuid: string
  createdAt: string
  modifiedAt: string
}
