import type { Payment, PaymentRequest } from '../entities/payment/types';
// import httpClient from '../shared/lib/httpClient';
import { paymentApiRepository } from '../features/payments/repositories/paymentApi.repository';

const paymentService = {
  async processPayment(data: PaymentRequest): Promise<Payment> {
    return await paymentApiRepository.processPayment(data);
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async processPaymentOld(data: PaymentRequest): Promise<Payment> {
    const response = await httpClient.post<Payment>('/payments', data);
    return response.data;
  },
  */
};

export default paymentService;
