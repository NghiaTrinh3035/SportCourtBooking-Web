import type { Booking, BookingRequest, BookingStatus } from '../../../entities/booking/types';
import { apiClient } from '../../../core/api/apiClient';

export const bookingApiRepository = {
  async createBooking(payload: BookingRequest): Promise<Booking> {
    return await apiClient.post<Booking>('/bookings', payload);
  },

  async getMyBookings(): Promise<Booking[]> {
    return await apiClient.get<Booking[]>('/bookings/me');
  },

  async getBookingById(id: number): Promise<Booking> {
    return await apiClient.get<Booking>(`/bookings/${id}`);
  },

  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return await apiClient.get<Booking[]>(`/bookings/owner/status/${status}`);
  },

  async updateBookingStatus(payload: {
    id: number;
    status: BookingStatus;
    cancelReason?: string;
  }): Promise<Booking> {
    return await apiClient.put<Booking>(`/bookings/${payload.id}/status`, {
      status: payload.status,
      cancelReason: payload.cancelReason,
    });
  },

  async cancelBooking(id: number, reason?: string): Promise<Booking> {
    return await apiClient.put<Booking>(`/bookings/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
  }
};
