import axios from 'axios';
import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import {
  GroupedByCategoryBudget,
  WeekBudgetItem,
  DuplicateBudgetResponse,
  MonthSummedUsage,
} from '@/components/budget/types';
import { Response } from './types';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const createBudget = (url: string, { arg }) => {
  return axios.post(url, arg).then(res => res.data)
}

const patchBudget = (url: string, { arg }: {
  arg: { isCompleted?: boolean, category?: string, budgetDate?: string };
}) => {
  const payload = {}

  if (arg.isCompleted !== undefined) {
    payload["isCompleted"] = arg.isCompleted
  }

  if (arg.category !== undefined) {
    payload["category"] = arg.category
  }

  if (arg.budgetDate !== undefined) {
    payload["budgetDate"] = arg.budgetDate
  }

  return axios.patch(url, payload).then(res => res.data)
}

export const useCreateBudget = (payload: any) => {
  const { trigger, isMutating } = useSWRMutation('budget/', createBudget, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useBudgetDetails = (
  uuid: string
): Response<any> => {
  const url = `budget/${uuid}/`
  const { data, error, isLoading } = useSWRImmutable(url, fetcher)

  return {
    data,
    isLoading,
    isError: error,
    url
  }
}

export const useEditBudget = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`budget/${uuid}/`, patchBudget, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useBudgetMonth = (
  dateFrom: string,
  dateTo: string,
  user: string,
): Response<GroupedByCategoryBudget[]> => {
  let url = `budget/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') url = `${url}&user=${user}`
  const { data, error, isLoading } = useSWRImmutable(url, fetcher);

  return {
    data,
    isLoading,
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
  const { data, error, isLoading } = useSWRImmutable(url, fetcher);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<WeekBudgetItem[]>;
}

export const usePendingBudget = (): Response<WeekBudgetItem[]> => {
  const url = 'budget/pending/'
  const { data, error, isLoading } = useSWRImmutable(url, fetcher)

  return {
    data,
    isLoading,
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
  const { data, error, isLoading } = useSWRImmutable(url, fetcher)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<DuplicateBudgetResponse[]>
}

export const useBudgetLastMonthsUsage = (
  month: string,
  category?: string,
): Response<MonthSummedUsage[]> => {
  let url = `budget/last-months/?category=${category}&month=${month}`
  const { data, error, isLoading } = useSWRImmutable(category ? url : null, fetcher)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<MonthSummedUsage[]>
}
