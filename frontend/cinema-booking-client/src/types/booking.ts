import { MovieItem } from './movie';
import { CinemaItem } from './cinema';

export interface HoldSeatRequest {
  showtimeId: number;
  seatIds: number[];
}

export interface HoldSeatResponse {
  success: boolean;
  bookingId: number;
  bookingCode: string;
  status: string;
  totalAmount: number;
  expiresAt: string;
  holdToken?: string;
  seatIds: number[];
}

export interface SeatAvailabilityResponse {
  seatId: number;
  status: 'Available' | 'Held' | 'Booked';
  price: number;
  holdExpiresAt?: string;
}

export interface BookingItemResponse {
  seatId: number;
  seatNumber: string;
  price: number;
}

export interface BookingDetailsResponse {
  id: number;
  bookingCode: string;
  userId: string;
  showtimeId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  items: BookingItemResponse[];
}

export interface SelectedSeatInfo {
  seatId: number;
  code: string;
  row: string;
  type: 'standard' | 'vip' | 'sweetbox';
  price: number;
}

export interface TicketRecord {
  id: string;
  bookingId?: number;
  bookingCode: string;
  movie: MovieItem;
  cinema: CinemaItem | { name: string; address: string };
  dateStr: string;
  time: string;
  format: string;
  room: string;
  seats: SelectedSeatInfo[];
  combos: Record<string, number>;
  totalPaid: number;
  paymentMethod: string;
  status: 'valid' | 'cancelled';
  createdAt: string;
}

