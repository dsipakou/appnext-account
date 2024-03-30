import axios from 'axios';
import useSWR from 'swr';
import { Response } from './types';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface Roles {
  name: string
}

export const useRoles = (): Response<Roles[]> => {
  const url = 'roles/';
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<Roles[]>;
};
