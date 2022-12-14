import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';

import {
  Sorting,
  TransactionResponse
} from '@/components/transactions/types'

interface TransactionRequest {
  sorting: Sorting
  limit: number
  dateFrom?: string
  dateTo?: string
}
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useTransactions = (
  {
    sorting='added',
    limit=15,
    dateFrom,
    dateTo
  }: TransactionRequest
): Response<TransactionResponse[]> => {
  let url = `transactions?sorting=${sorting}&limit=${limit}`
  if (dateFrom && dateTo) {
    url += `&dateFrom=${dateFrom}&dateTo=${dateTo}`
  }

  const { data, error, isValidating } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}
