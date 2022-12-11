export interface Account {
  uuid: string
  title: string
  category: string | null
  user: string
  isMain: boolean
  description: string
  createdAt: string
  modifiedAt: string
}
