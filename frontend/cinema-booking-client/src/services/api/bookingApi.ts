import { apiClient } from './client';
import {
  BookingDetailsResponse,
  CheckInTicketResponse,
  HoldSeatRequest,
  HoldSeatResponse,
  SeatAvailabilityResponse
} from '../../types/booking';
import { AdminBooking } from '../../types/admin';

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
  },

  async checkInTicket(ticketCode: string): Promise<CheckInTicketResponse> {
    const response = await apiClient.post<CheckInTicketResponse>(`/api/bookings/${encodeURIComponent(ticketCode)}/check-in`);
    return response.data;
  },

  async toggleSeatMaintenance(showtimeId: number, seatId: number, isMaintenance?: boolean): Promise<{ success: boolean; isMaintenance: boolean }> {
    const response = await apiClient.put(`/api/bookings/showtimes/${showtimeId}/seats/${seatId}/maintenance`, {
      isMaintenance
    });
    return response.data;
  },

  async unlockAllMaintenance(showtimeId: number): Promise<{ success: boolean; unlockedCount: number }> {
    const response = await apiClient.post(`/api/bookings/showtimes/${showtimeId}/seats/unlock-maintenance`);
    return response.data;
  },

  async getAdminBookings(): Promise<AdminBooking[]> {
    try {
      const response = await apiClient.get<BookingDetailsResponse[]>('/api/bookings/admin/all');
      return response.data.map((b) => {
        const d = new Date(b.createdAt);
        const datetime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.toLocaleDateString('vi-VN')}`;
        const combosStr = (b.concessions || []).map((c) => `${c.quantity}x ${c.name}`).join(', ') || 'Không có';
        const seatCodes = b.items.map((i) => i.seatNumber);

        let status: 'active' | 'checked-in' | 'cancelled' = 'active';
        if (b.status === 'CheckedIn') status = 'checked-in';
        else if (b.status === 'Cancelled' || b.status === 'Expired') status = 'cancelled';

        return {
          code: b.bookingCode,
          customerName: b.customerName || 'Khách hàng',
          customerPhone: b.customerPhone || '0988123456',
          movieTitle: `Suất chiếu #${b.showtimeId}`,
          room: 'Phòng chiếu',
          datetime,
          seats: seatCodes,
          combos: combosStr,
          totalPaid: b.totalAmount,
          paymentMethod: b.paymentMethod || 'Ví Điện Tử',
          status
        };
      });
    } catch {
      return [];
    }
  }
};
