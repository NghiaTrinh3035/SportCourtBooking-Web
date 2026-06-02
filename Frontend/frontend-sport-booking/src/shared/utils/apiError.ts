import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/common';

export const getApiErrorMessage = (error: unknown): string => {
  const fallback = 'Co loi xay ra, vui long thu lai.';

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError?.message) {
    return axiosError.message;
  }

  return fallback;
};
