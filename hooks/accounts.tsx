"use client"

import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import { AccountResponse } from '@/components/accounts/types'
import {
  fetchReq,
  postReq,
  deleteReq,
  patchReq,
} from '@/plugins/axios'
import { Response } from './types'

export const useAccounts = (): Response<AccountResponse[]> => {
  const url = 'accounts/'
  const { data, error, isLoading } = useSWRImmutable(url, fetchReq)

  return {
    data,
    isLoading,
    isError: error
  } as Response<AccountResponse[]>
}

export const useAccount = (uuid: string): Response<unknown> => {
  const { data, error, isLoading } = useSWRImmutable(uuid ? `accounts/${uuid}/` : null, fetchReq)

  return {
    data,
    isLoading,
    isError: error,
  } as Response<unknown>
}

export const useCreateAccount = (payload: any) => {
  const { trigger, isMutating } = useSWRMutation('accounts/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useUpdateAccount = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`accounts/${uuid}/`, patchReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useReassignTransactions = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`accounts/${uuid}/reassign/`, postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useDeleteAccount = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`accounts/${uuid}/`, deleteReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}
