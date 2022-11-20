import axios from 'axios';
import useSWR from 'swr';
import { CategoryType } from '@/components/categories/types';
import { Response } from './types';

export interface CategoryResponse {
  uuid: string
  name: string
  parent: string
  type: CategoryType
  createdAt: string
  modifiedAt: string
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useCategories = (): Response<CategoryResponse[]> => {
  const { data, error, isValidating } = useSWR('categories/', fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<CategoryResponse[]>;
};
