import axios from 'axios';
import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import { CategoryType } from '@/components/categories/types';
import { Response } from './types';
import { fetchReq, postReq, deleteReq, patchReq } from '@/plugins/axios';

export interface CategoryResponse {
  uuid: string
  name: string
  parent: string
  type: CategoryType
  description: string
  createdAt: string
  modifiedAt: string
}

export const useCategories = (): Response<CategoryResponse[]> => {
  const { data = [], error, isLoading } = useSWRImmutable('categories/', fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse[]>;
};

export const useCreateCategory = () => {
  const { trigger, isMutating } = useSWRMutation('categories/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useReassignTransactions = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`categories/${uuid}/reassign/`, postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useDeleteCategory = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`categories/${uuid}/`, deleteReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useCategory = (uuid: string | undefined): Response<CategoryResponse> => {
  const { data, error, isLoading } = useSWRImmutable(uuid ? `categories/${uuid}/` : null, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse>
}
