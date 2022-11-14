import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useCurrencies = () => {
  const { data, error, isValidating } = useSWR('currencies/', fetcher);

  return {
    currencies: data,
    isLoading: !data && !error,
    isError: error,
  };
};
