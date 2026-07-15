'use client';

import useSWRImmutable from 'swr/immutable';

import { WeekTransferBudgetItem } from '@/components/budget/types';
import { fetchReq } from '@/plugins/axios';

import { Response } from './types';

export const useTransferBudgetMonth = (dateFrom: string, dateTo: string, user?: string): Response<WeekBudgetItem[]> => {
  let url = `transfer-budgets/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') {
    url = `${url}&user=${user}`;
  }
  const { data, error, isLoading } = useSWRImmutable(dateFrom && dateTo ? url : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<any[]>;
};

export const useTransferBudgetWeek = (dateFrom: string, dateTo: string, user?: string): Response<WeekBudgetItem[]> => {
  let url = `transfer-budgets/weekly-usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  if (user && user !== 'all') {
    url = `${url}&user=${user}`;
  }
  const { data, error, isLoading } = useSWRImmutable(dateFrom && dateTo ? url : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<WeekTransferBudgetItem[]>;
};
