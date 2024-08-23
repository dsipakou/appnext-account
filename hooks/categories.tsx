import axios from 'axios';
import useSWRImmutable from 'swr/immutable'
import { CategoryType } from '@/components/categories/types';
import { Response } from './types';

export interface CategoryResponse {
  uuid: string
  name: string
  parent: string
  type: CategoryType
  description: string
  createdAt: string
  modifiedAt: string
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useCategories = (): Response<CategoryResponse[]> => {
  const { data = [], error, isLoading } = useSWRImmutable('categories/', fetcher);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse[]>;
};

export const useCategory = (uuid: string | undefined): Response<CategoryResponse> => {
  const { data, error, isLoading } = useSWRImmutable(uuid ? `categories/${uuid}/` : null, fetcher)

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse>
}
