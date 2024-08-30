import useSWRImmutable from 'swr/immutable'
import useSWRMutation from 'swr/mutation'
import { fetchReq, postReq, deleteReq, patchReq } from '@/plugins/axios'

export const useCurrencies = () => {
  const { data, error, isLoading } = useSWRImmutable('currencies/', fetchReq)

  return {
    data,
    isLoading,
    isError: error,
  }
}

export const useCreateCurrency = () => {
  const { trigger, isMutating } = useSWRMutation('currencies/', postReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useUpdateCurrency = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`currencies/${uuid}/`, patchReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}

export const useDeleteCurrency = (uuid: string) => {
  const { trigger, isMutating } = useSWRMutation(`currencies/${uuid}/`, deleteReq, { revalidate: true })

  return {
    trigger,
    isMutating,
  }
}
