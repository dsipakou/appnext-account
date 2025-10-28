'use client';

import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';
import {
  GroupedByCategoryBudget,
  BudgetItem,
  WeekBudgetItem,
  DuplicateBudgetResponse,
  MonthSummedUsage,
} from '@/components/budget/types';
import { fetchReq, postReq, deleteReq, patchReq } from '@/plugins/axios';
import { Response } from './types';

export const useCreateBudget = (payload: any) => {
  const { trigger, isMutating } = useSWRMutation('budget/', postReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useDeleteBudget = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`budget/${uuid}/`, deleteReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useBudgetDetails = (uuid: string): Response<any> => {
  const url = `budget/${uuid}/`;
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  };
};

export const useEditBudget = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`budget/${uuid}/`, patchReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useBudgetMonth = (dateFrom: string, dateTo: string, user: string): Response<GroupedByCategoryBudget[]> => {
  let url = `budget/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') url = `${url}&user=${user}`;
  const { data, error, isLoading } = useSWRImmutable(dateFrom && dateTo ? url : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<GroupedByCategoryBudget[]>;
};

export const useBudgetWeek = (dateFrom: string, dateTo: string, user?: string): Response<WeekBudgetItem[]> => {
  let url = `budget/weekly-usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') {
    url = `${url}&user=${user}`;
  }
  const { data, error, isLoading } = useSWRImmutable(dateFrom && dateTo ? url : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<WeekBudgetItem[]>;
};

export const usePendingBudget = (): Response<WeekBudgetItem[]> => {
  const url = 'budget/pending/';
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<WeekBudgetItem[]>;
};

export const useGetDuplicates = (type: 'month' | 'week', date: string): Response<DuplicateBudgetResponse[]> => {
  const typeMap = {
    week: 'weekly',
    month: 'monthly',
  };
  let url = `budget/duplicate/?type=${typeMap[type]}&date=${date}&include_occasional=true`;
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<DuplicateBudgetResponse[]>;
};

export const useGetUpcommingBudget = (): Response<BudgetItem[]> => {
  const { data, error, isLoading } = useSWRImmutable('budget/upcomming/', fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<BudgetItem[]>;
};

export const useBudgetLastMonthsUsage = (month: string, category?: string): Response<MonthSummedUsage[]> => {
  let url = `budget/last-months/?category=${category}&month=${month}`;
  const { data, error, isLoading } = useSWRImmutable(category ? url : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<MonthSummedUsage[]>;
};

export const useDuplicateBudget = () => {
  const { trigger, isMutating } = useSWRMutation('budget/duplicate/', postReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useOccasionalBudgets = (user?: string): Response<BudgetItem[]> => {
  let url = 'budget/?recurrent=occasional';
  if (user && user !== 'all') {
    url = `${url}&user=${user}`;
  }
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<BudgetItem[]>;
};
