"use client"

import axios from 'axios'
import useSWRImmutable from 'swr/immutable'
import { AccountResponse } from '@/components/accounts/types'
import { Response } from './types'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export const useAccounts = (): Response<AccountResponse[]> => {
  const url = 'accounts/'
  const { data, error, isLoading } = useSWRImmutable(url, fetcher)

  return {
    data,
    isLoading,
    isError: error
  } as Response<AccountResponse[]>
}

