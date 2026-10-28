export type SeatType = 'Regular' | 'VIP' | 'Couple';
export type ShowtimeStatus = 'Scheduled' | 'Started' | 'Completed' | 'Cancelled';

export interface BackendSeat {
  id: number;
  screenId: number;
  row: string;
  column: string;
  seatNumber: string;
  seatType: number | SeatType;
}

export interface BackendScreen {
  id: number;
  cinemaId: number;
  name: string;
  seats?: BackendSeat[];
}

export interface BackendCinema {
  id: number;
  name: string;
  address: string;
  description?: string;
  createdAt?: string;
  screens?: BackendScreen[];
}

export interface BackendShowtime {
  id: number;
  movieId: number;
  screenId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: number | ShowtimeStatus;
  screen?: BackendScreen;
}

export interface CinemaItem {
  id: number;
  name: string;
  address: string;
  city: 'Hà Nội' | 'TP. Hồ Chí Minh' | 'Đà Nẵng';
  screens: {
    id: number;
    name: string;
    format: string;
  }[];
}

export interface ShowtimeSlot {
  id: number;
  time: string;
  format: string;
  room: string;
  price: number;
  screenId?: number;
}

export interface SeatGridItem {
  id: number;
  code: string;
  row: string;
  col: number;
  type: 'standard' | 'vip' | 'sweetbox';
  price: number;
  isSold: boolean;
  isHeld?: boolean;
}

