import type { Payment, PaymentRequest, PaymentResponse } from '../../../entities/payment/types';
import { apiClient } from '../../../core/api/apiClient';

export const paymentApiRepository = {
  async processPayment(data: PaymentRequest): Promise<Payment> {
    return await apiClient.post<Payment>('/payments', data);
  },
  async createVnPayPayment(data: PaymentRequest): Promise<PaymentResponse> {
    return await apiClient.post<PaymentResponse>('/payments/create-vnpay', data);
  },
};
