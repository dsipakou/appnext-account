import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';

import { CategoryResponse } from '@/components/categories/types';
import { deleteReq, fetchReq, patchReq, postReq } from '@/plugins/axios';

import { Response } from './types';

export const useCategories = (): Response<CategoryResponse[]> => {
  const { data = [], error, isLoading } = useSWRImmutable('categories/', fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse[]>;
};

export const useCreateCategory = () => {
  const { trigger, isMutating } = useSWRMutation('categories/', postReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useUpdateCategory = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`categories/${uuid}/`, patchReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useReassignTransactions = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`categories/${uuid}/reassign/`, postReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useDeleteCategory = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`categories/${uuid}/`, deleteReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};

export const useCategory = (uuid: string | undefined): Response<CategoryResponse> => {
  const { data, error, isLoading } = useSWRImmutable(uuid ? `categories/${uuid}/` : null, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<CategoryResponse>;
};

export const useReorderCategories = () => {
  const { trigger, isMutating } = useSWRMutation('categories/reorder/', postReq, { revalidate: true });

  return {
    trigger,
    isMutating,
  };
};
