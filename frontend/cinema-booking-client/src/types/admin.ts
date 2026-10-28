export type AdminModuleType = 'dashboard' | 'users' | 'movies' | 'showtimes' | 'bookings' | 'fnb';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Quản trị viên' | 'Nhân viên soát vé' | 'Khách hàng VIP' | 'Thành viên';
  points: number;
  joined: string;
  status: 'active' | 'locked';
}

export interface AdminMovie {
  id: string;
  title: string;
  director: string;
  genre: string;
  duration: string;
  age: 'P' | 'C13' | 'C16' | 'C18';
  rating: number;
  basePrice: number;
  status: 'showing' | 'upcoming' | 'ended';
  poster: string;
}

export interface AdminShowtime {
  id: string;
  movieTitle: string;
  room: string;
  format: string;
  time: string;
  date: string;
}

export interface AdminBooking {
  code: string;
  customerName: string;
  customerPhone: string;
  movieTitle: string;
  room: string;
  datetime: string;
  seats: string[];
  combos: string;
  totalPaid: number;
  paymentMethod: string;
  status: 'active' | 'checked-in' | 'cancelled';
}

export interface AdminFnb {
  id: string;
  name: string;
  desc: string;
  price: number;
  inStock: boolean;
}

export interface AdminVoucher {
  code: string;
  title: string;
  type: 'fixed' | 'percent';
  value: number;
  active: boolean;
}

