import axios from 'axios';
import useSWR from 'swr';
import { GroupedByCategoryBudget } from '@/components/budget/types';
import { Response } from './types';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useBudgetMonth = (
  dateFrom: string,
  dateTo: string,
): Response<GroupedByCategoryBudget[]> => {
  const url = `budget/usage/?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<GroupedByCategoryBudget[]>;
} 
