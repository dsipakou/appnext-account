import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useCategories = () => {
  const { data, error, isValidating } = useSWR('categories/', fetcher);

  return {
    categories: data,
    isLoading: !data && !error,
    isError: error,
  };
};
