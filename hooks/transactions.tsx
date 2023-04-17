import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';
import { TransactionsReportResponse } from '@/components/transactions/types'

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
    sorting = 'added',
    limit = 15,
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

export const useTransactionsReport = (
  dateFrom: string,
  dateTo: string,
  currency: string
): Response<TransactionsReportResponse[]> => {
  const url = `transactions/report?dateFrom=${dateFrom}&dateTo=${dateTo}&currency=${currency}`

  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<TransactionsReportResponse[]>
}

export const useTransactionsMonthlyReport = (
  dateFrom: string,
  dateTo: string,
  currency: string,
  numberOfDays?: number,
): Response<unknown[]> => {
  let url = `transactions/report-monthly?dateFrom=${dateFrom}&dateTo=${dateTo}&currency=${currency}`

  if (numberOfDays) {
    url += `&numberOfDays=${numberOfDays}`
  }

  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<unknown[]>
}

export const useBudgetTransactions = (
  uuid: string
): Response<TransactionResponse[]> => {
  const url = `transactions/budget/${uuid}/`

  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}

export const useTransaction = (
  uuid: string
): Response<TransactionResponse> => {
  const url = `transactions/${uuid}/`

  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url
  } as Response<TransactionResponse>
}

