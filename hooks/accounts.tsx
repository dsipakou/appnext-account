import axios from 'axios'
import useSWR from 'swr'
import { AccountResponse } from '@/components/accounts/types'
import { Response } from './types'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export const useAccounts = (): Response<AccountResponse[]> => {
  const url = 'accounts/'
  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error
  } as Response<AccountResponse[]>
}

