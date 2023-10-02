import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';
import { AvailableRates } from '@/components/rates/types'

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

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useRatesChart = (period: number = 30): Response<ChartResponse[]> => {
  const url = `rates/chart/?range=${period}`;
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<ChartResponse[]>;
};

export const useRates = (limit: number = 5): Response<RateResponse[]> => {
  const url: string = `rates?limit=${limit}`;
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<RateResponse[]>;
}

export const useRatesOnDate = (date: string): Response<RateResponse[]> => {
  const url: string = `rates/day/${date}`
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
    url,
  } as Response<RateResponse[]>
}

export const useAvailableRates = (date: string): Response<AvailableRates> => {
  const { data, error, isValidating } = useSWR(date ? `rates/available?date=${date}` : null, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error
  } as Response<AvailableRates>
}
