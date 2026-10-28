import { apiClient } from './client';
import {
  BookingDetailsResponse,
  HoldSeatRequest,
  HoldSeatResponse,
  SeatAvailabilityResponse
} from '../../types/booking';

export const bookingApi = {
  async getSeatAvailability(showtimeId: number): Promise<SeatAvailabilityResponse[]> {
    try {
      const response = await apiClient.get<SeatAvailabilityResponse[]>(
        `/api/bookings/showtimes/${showtimeId}/seats`
      );
      return response.data;
    } catch {
      return [];
    }
  },

  async holdSeats(data: HoldSeatRequest): Promise<HoldSeatResponse> {
    const response = await apiClient.post<HoldSeatResponse>('/api/bookings/hold', data);
    return response.data;
  },

  async confirmBooking(
    bookingId: number,
    idempotencyKey?: string
  ): Promise<{ success: boolean; bookingId: number; bookingCode: string; status: string }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const response = await apiClient.post(
      `/api/bookings/${bookingId}/confirm`,
      {},
      { headers }
    );
    return response.data;
  },

  async cancelBooking(
    bookingId: number
  ): Promise<{ success: boolean; message: string; bookingId: number }> {
    const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },

  async getMyBookings(): Promise<BookingDetailsResponse[]> {
    try {
      const response = await apiClient.get<BookingDetailsResponse[]>('/api/bookings/my-bookings');
      return response.data;
    } catch {
      return [];
    }
  }
};

