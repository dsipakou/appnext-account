"use client"

import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import { AccountResponse } from '@/components/accounts/types'
import { fetchReq, postReq } from '@/plugins/axios'
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

export const useCreateAccount = (payload: any) => {
  const { trigger, isMutating } = useSWRMutation('accounts/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}
