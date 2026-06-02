import type { Booking, BookingRequest, BookingStatus } from '../entities/booking/types';
// import httpClient from '../shared/lib/httpClient';
import { bookingApiRepository } from '../features/bookings/repositories/bookingApi.repository';

const bookingService = {
  async createBooking(payload: BookingRequest): Promise<Booking> {
    return await bookingApiRepository.createBooking(payload);
  },

  async getMyBookings(): Promise<Booking[]> {
    return await bookingApiRepository.getMyBookings();
  },

  async getBookingById(id: number): Promise<Booking> {
    return await bookingApiRepository.getBookingById(id);
  },

  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return await bookingApiRepository.getBookingsByStatus(status);
  },

  async updateBookingStatus(payload: {
    id: number;
    status: BookingStatus;
    cancelReason?: string;
  }): Promise<Booking> {
    return await bookingApiRepository.updateBookingStatus(payload);
  },

  async cancelBooking(id: number, reason?: string): Promise<Booking> {
    return await bookingApiRepository.cancelBooking(id, reason);
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async createBookingOld(payload: BookingRequest): Promise<Booking> {
    const response = await httpClient.post<Booking>('/bookings', payload);
    return response.data;
  },

  async getMyBookingsOld(): Promise<Booking[]> {
    const response = await httpClient.get<Booking[]>('/bookings/me');
    return response.data;
  },

  async getBookingByIdOld(id: number): Promise<Booking> {
    const response = await httpClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async getBookingsByStatusOld(status: BookingStatus): Promise<Booking[]> {
    const response = await httpClient.get<Booking[]>(`/bookings/owner/status/${status}`);
    return response.data;
  },

  async updateBookingStatusOld(payload: {
    id: number;
    status: BookingStatus;
    cancelReason?: string;
  }): Promise<Booking> {
    const response = await httpClient.put<Booking>(`/bookings/${payload.id}/status`, {
      status: payload.status,
      cancelReason: payload.cancelReason,
    });
    return response.data;
  },

  async cancelBookingOld(id: number, reason?: string): Promise<Booking> {
    const response = await httpClient.put<Booking>(`/bookings/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return response.data;
  },
  */
};

export default bookingService;
