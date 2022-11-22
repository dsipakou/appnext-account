export interface Response<T> {
  data: T
  isLoading: boolean
  isError: boolean
  url?: string
}
