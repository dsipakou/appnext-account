export enum CategoryType {
  Income = 'INC',
  Expense = 'EXP'
  CapitalExpense = 'CAP'
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

export interface CategoryResponse {
  uuid: string
  name: string
  parent: string
  type: CategoryType
  description: string
  createdAt: string
  modifiedAt: string
}
