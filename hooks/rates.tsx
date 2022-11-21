import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';

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
  const { data, error, isValidating } = useSWR(`rates/chart/?range=${period}`, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<ChartResponse[]>;
};

export const useRates = (limit: number = 5): Response<RateResponse[]> => {
  const { data, error, isValidating } = useSWR(`rates?limit=${limit}`, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<RateResponse[]>;
}

export const useRatesOnDate = (date: string): Response<RateResponse[]> => {
  const { data, error, isValidating } = useSWR(`rates/day/${date}`, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<RateResponse[]>
}
