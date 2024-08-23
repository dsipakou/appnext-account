import axios from 'axios';
import useSWRImmutable from 'swr/immutable';
import { Response } from './types';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface Roles {
  name: string
}

export const useRoles = (): Response<Roles[]> => {
  const url = 'roles/';
  const { data, error, isLoading } = useSWRImmutable(url, fetcher);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<Roles[]>;
};
