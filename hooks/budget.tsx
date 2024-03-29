import axios from 'axios';
import useSWR from 'swr';
import {
  GroupedByCategoryBudget,
  WeekBudgetItem,
  DuplicateBudgetResponse,
  MonthSummedUsage,
} from '@/components/budget/types';
import { Response } from './types';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useBudgetDetails = (
  uuid: string
): Response<any> => {
  const url = `budget/${uuid}/`
  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  }
}

export const useBudgetMonth = (
  dateFrom: string,
  dateTo: string,
  user: string,
): Response<GroupedByCategoryBudget[]> => {
  let url = `budget/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') url = `${url}&user=${user}`
  const { data, error } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<GroupedByCategoryBudget[]>;
}

export const useBudgetWeek = (
  dateFrom: string,
  dateTo: string,
  user?: string,
): Response<WeekBudgetItem[]> => {
  let url = `budget/weekly-usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') url = `${url}&user=${user}`
  const { data, error } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<WeekBudgetItem[]>;
}

export const usePendingBudget = (): Response<WeekBudgetItem[]> => {
  const url = 'budget/pending/'
  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<WeekBudgetItem[]>
}

export const useBudgetDuplicate = (
  type: "month" | "week",
  date: string
): Response<DuplicateBudgetResponse[]> => {
  const typeMap = {
    week: "weekly",
    month: "monthly"
  }
  let url = `budget/duplicate/?type=${typeMap[type]}&date=${date}`
  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<DuplicateBudgetResponse[]>
}

export const useBudgetLastMonthsUsage = (
  month: string,
  category?: string,
): Response<MonthSummedUsage[]> => {
  let url = `budget/last-months/?category=${category}&month=${month}`
  const { data, error } = useSWR(category ? url : null, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<MonthSummedUsage[]>
}
