import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useRatesChart: void = (period: number = 30) => {
  const { data, error, isValidating } = useSWR(`rates/chart/?range=${period}`, fetcher);

  return {
    chartRates: data,
    isLoading: !data && !error,
    isError: error,
  };
};

export const useRates: void = (limit: number = 5) => {
  const { data, error, isValidating } = useSWR(`rates?limit=${limit}`, fetcher);

  return {
    rates: data,
    isLoading: !data && !error,
    isError: error,
  };
}
