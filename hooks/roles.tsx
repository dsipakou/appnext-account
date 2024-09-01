import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';
import { Response } from './types';
import { fetchReq, patchReq } from '@/plugins/axios';

export interface Roles {
  name: string
}

export const useRoles = (): Response<Roles[]> => {
  const url = 'roles/';
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<Roles[]>;
};

export const useUpdateRole = (uuid: string) => {
  const { trigger } = useSWRMutation(`users/role/${uuid}/`, patchReq)

  return {
    trigger,
  }
}

