import type { AxiosRequestConfig } from 'axios';
import axiosInstance from './axios';
import type { ApiResponse } from './apiResponse';

export const apiClient = {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data.data;
    },

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data.data;
    },

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
        return response.data.data;
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
        return response.data.data;
    }
};
