import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';
import { Response } from './types';
import { Invite } from '@/components/users/types'
import { fetchReq, postReq } from '@/plugins/axios';

export interface UserResponse {
  uuid: string
  email: string
  role: string
  username: string
  firstName: string
  lastName: string
  currency: string | null
  isActive: boolean
  isStaff: boolean
  dateJoined: string
}


export const useUsers = (): Response<UserResponse[]> => {
  const url = 'users/';
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq);

  return {
    data,
    isLoading,
    isError: error,
  } as Response<UserResponse[]>;
};

export const useCreateUser = () => {
  const { trigger, isMutating } = useSWRMutation('users/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useCreateInvite = () => {
  const { trigger, isMutating } = useSWRMutation('users/invite/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useInvites = (): Response<Invite[]> => {
  const url = 'users/invite/'
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
  } as Response<Invite[]>
}
