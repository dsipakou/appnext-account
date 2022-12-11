import axios from 'axios'
import useSWR from 'swr'
import { Account } from '@/components/accounts/types'
import { Response } from './types'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export const useAccounts = (): Response<Account[]> => {
  const url = 'accounts/'
  const { data, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading: !data && !error,
    isError: error
  } as Response<Account[]>
}

