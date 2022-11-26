import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';

export type RecurrentTypes = 'monthly' | 'weekly';

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
  budgets: MonthOverallBudgetItem[]
}

export interface MonthOverallBudgetItem extends PlannedMap, SpentMap {
  uuid: string
  title: string
  items: MonthBudgetItem[]
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

export interface TransactionItem extends SpentMap {
  uuid: string
  currency: string
  currencyCode: string
  transactionDate: string
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useBudgetMonth = ({ dateFrom, dateTo }): Response<GroupedByCategoryBudget[]> => {
  const url = `budget/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<GroupedByCategoryBudget[]>;
} 
