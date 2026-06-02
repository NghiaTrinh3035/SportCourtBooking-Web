import type { Court } from '../court/types';
import type { User } from '../user/types';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DEPOSITED'
  | 'CANCELED'
  | 'COMPLETED';

export interface BookingRequest {
  courtId: number;
  startTime: string;
  endTime: string;
  note?: string;
  userId?: number;
}

export interface Booking {
  id: number;
  user?: User;
  court?: Court;
  startTime: string;
  endTime: string;
  totalPrice?: number;
  status: BookingStatus;
  note?: string;
  cancelReason?: string;
  createdAt?: string;
}
