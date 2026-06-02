import type { Payment, PaymentRequest } from '../../../entities/payment/types';
import { apiClient } from '../../../core/api/apiClient';

export const paymentApiRepository = {
  async processPayment(data: PaymentRequest): Promise<Payment> {
    return await apiClient.post<Payment>('/payments', data);
  },
};
