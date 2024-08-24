export const extractErrorMessage = (error: any): string => {
  const errRes = error as AxiosError
  return errRes.response?.data || errRes.message
}
