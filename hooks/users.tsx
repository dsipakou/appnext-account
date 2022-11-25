import axios from 'axios';
import useSWR from 'swr';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import MonthPicker from '@mui/x-date-pickers/MonthPicker';
import { Response } from './types';

export interface UserResponse {
  uuid: string
  email: string
  username: string
  firstName: string
  lastName: string
  currency: string | null
  isActive: boolean
  isStaff: boolean
  dateJoined: string
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const useUsers = (): Response<UserResponse[]> => {
  const url = 'users/';
  const { data, error, isValidating } = useSWR(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: error,
  } as Response<UserResponse[]>;
};
