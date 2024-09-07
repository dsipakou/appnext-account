import useSWR from 'swr';
import useSWRMutation from 'swr/mutation'
import useSWRImmutable from 'swr/immutable'
import { Response } from './types';
import { AvailableRate } from '@/components/rates/types'
import { fetchReq, postReq } from '@/plugins/axios'

export interface RateResponse {
  uuid: string
  currency: string
  rate: number
  rateDate: string
  baseCurrency: string
  description: string
  createdAt: string
  modifiedAt: string
}

export interface ChartItem {
  rate: string
  rateDate: string
}

export interface ChartResponse {
  currencyUuid: string
  data: ChartItem[]
}

export const useRatesChart = (period: number = 30): Response<ChartResponse[]> => {
  const url = `rates/chart/?range=${period}`;
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<ChartResponse[]>;
};

export const useCreateBatchedRates = () => {
  const { trigger, isMutating } = useSWRMutation("rates/batched/", postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}


export const useRates = (limit: number = 5): Response<RateResponse[]> => {
  const url: string = `rates?limit=${limit}`;
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<RateResponse[]>;
}

export const useRatesOnDate = (date: string): Response<RateResponse[]> => {
  const url: string = `rates/day/${date}`
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
    url,
  } as Response<RateResponse[]>
}

export const useAvailableRates = (date: string): Response<AvailableRate[]> => {
  const { data, error, isLoading } = useSWR(date ? `rates/available?date=${date}` : null, fetchReq)

  return {
    data,
    isLoading,
    isError: error
  } as Response<AvailableRate[]>
}
