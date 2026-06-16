import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'VNPAY';

export class PaymentRequest {
  @IsNotEmpty({ message: 'Mã đơn không được để trống' })
  @IsNumber({}, { message: 'Mã đơn phải là một số hợp lệ' })
  bookingId: number = 0;

  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là một số hợp lệ' })
  amount: number = 0;

  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  @IsString({ message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: PaymentMethod = 'CASH';

  transactionRef?: string;
  bookingInfo?: string;
}

export interface Payment {
  id: number;
  bookingId?: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: string;
  transactionRef?: string;
  bookingInfo?: string;
}

export interface PaymentResponse {
  status: string;
  message: string;
  paymentUrl: string;
}
