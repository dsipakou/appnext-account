import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Response } from './types';
import { TransactionsReportResponse, AccountUsage } from '@/components/transactions/types'
import { ChartData } from '@/components/reports/types'
import { fetchReq, patchReq, postReq, deleteReq } from '@/plugins/axios';

import {
  Sorting,
  TransactionResponse
} from '@/components/transactions/types'

interface TransactionRequest {
  sorting?: Sorting
  limit?: number
  type?: string
  dateFrom?: string
  dateTo?: string
}
export const useTransactions = (
  {
    sorting = 'added',
    limit = 15,
    type = 'outcome',
    dateFrom,
    dateTo,
  }: TransactionRequest
): Response<TransactionResponse[]> => {
  let url = `transactions?sorting=${sorting}&limit=${limit}&type=${type}`
  if (dateFrom && dateTo) {
    url += `&dateFrom=${dateFrom}&dateTo=${dateTo}`
  }

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}

export const useCreateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation('transactions/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useUpdateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation('transactions/', patchReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useDeleteTransaction = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`transactions/${uuid}`, deleteReq, { revalidate: true })

  return {
    trigger,
    isMutating
  }
}

export const useReadLastAddedTransactions = () => {
  const { trigger, isMutating } = useSWRMutation('transactions/last-added/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useTransactionsReport = (
  dateFrom: string,
  dateTo: string,
  currency: string
): Response<TransactionsReportResponse[]> => {
  const url = `transactions/report?dateFrom=${dateFrom}&dateTo=${dateTo}&currency=${currency}`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionsReportResponse[]>
}

export const useTransactionsMonthlyReport = (
  dateFrom: string,
  dateTo: string,
  currency: string,
  numberOfDays?: number,
): Response<ChartData[]> => {
  let url = `transactions/report-monthly?dateFrom=${dateFrom}&dateTo=${dateTo}&currency=${currency}`

  if (numberOfDays) {
    url += `&numberOfDays=${numberOfDays}`
  }

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<ChartData[]>
}

export const useBudgetTransactions = (
  uuid: string
): Response<TransactionResponse[]> => {
  const url = `transactions/budget/${uuid}/`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}

export const useAccountUsage = (
  uuid: string
): Response<AccountUsage[]> => {
  const url = `transactions/account/${uuid}/usage/`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<AccountUsage[]>
}

export const useCategoryTransactions = (
  uuid: string
): Response<TransactionResponse[]> => {
  const url = `transactions/category/${uuid}/`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}

export const useLastAddedTransactions = (): Response<TransactionResponse[]> => {
  const url = `transactions/last-added/`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionResponse[]>
}

export const useTransaction = (
  uuid: string
): Response<TransactionResponse> => {
  const url = `transactions/${uuid}/`

  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url
  } as Response<TransactionResponse>
}

