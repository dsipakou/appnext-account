import axios from 'axios';
import useSWRImmutable from 'swr/immutable'

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useCurrencies = () => {
  const { data, error, isLoading } = useSWRImmutable('currencies/', fetcher);

  return {
    data,
    isLoading,
    isError: error,
  };
};
