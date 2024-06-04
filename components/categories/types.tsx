export enum CategoryType {
  Income = 'INC'
  Expense = 'EXP'
}

export interface Category {
  icon: string | null
  uuid: string
  name: string
  parent: string | null
  type: CategoryType
}

export interface CategoryRequest {
  name: string
  type: string
  parent: string | null
}
