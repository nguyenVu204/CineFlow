import {
  AdminUser,
  AdminMovie,
  AdminShowtime,
  AdminBooking,
  AdminFnb,
  AdminVoucher
} from '../../types/admin';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Lê Quản Trị',
    email: 'admin@cineverse.vn',
    phone: '0901112222',
    role: 'Quản trị viên',
    points: 5000,
    joined: '01/01/2024',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Trần Minh Quân',
    email: 'quan.staff@cineverse.vn',
    phone: '0903334444',
    role: 'Nhân viên soát vé',
    points: 1200,
    joined: '15/05/2024',
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0987654321',
    role: 'Khách hàng VIP',
    points: 3450,
    joined: '10/08/2024',
    status: 'active'
  },
  {
    id: 'u4',
    name: 'Phạm Hoàng Yến',
    email: 'yenpham.vip@gmail.com',
    phone: '0912345678',
    role: 'Khách hàng VIP',
    points: 2890,
    joined: '22/09/2024',
    status: 'active'
  },
  {
    id: 'u5',
    name: 'Đỗ Quang Huy',
    email: 'huydo99@yahoo.com',
    phone: '0977888999',
    role: 'Thành viên',
    points: 420,
    joined: '05/01/2025',
    status: 'active'
  },
  {
    id: 'u6',
    name: 'Vũ Thị Mai',
    email: 'maivu_locked@gmail.com',
    phone: '0933445566',
    role: 'Thành viên',
    points: 0,
    joined: '19/02/2025',
    status: 'locked'
  }
];

export const INITIAL_ADMIN_MOVIES: AdminMovie[] = [
  {
    id: 'm1',
    title: 'Hành Tinh Cát: Phần Hai',
    director: 'Denis Villeneuve',
    genre: 'Khoa Học Viễn Tưởng',
    duration: '166 phút',
    age: 'C16',
    rating: 9.4,
    basePrice: 115000,
    status: 'showing',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm2',
    title: 'Kẻ Đánh Cắp Giấc Mơ: Tái Khởi',
    director: 'Christopher Nolan',
    genre: 'Hành Động',
    duration: '148 phút',
    age: 'C13',
    rating: 9.2,
    basePrice: 105000,
    status: 'showing',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm3',
    title: 'Quỷ Ám Tầng Hầm Số 9',
    director: 'James Wan',
    genre: 'Kinh Dị',
    duration: '112 phút',
    age: 'C18',
    rating: 8.5,
    basePrice: 95000,
    status: 'showing',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm4',
    title: 'Vương Quốc Mây Trắng',
    director: 'Makoto Shinkai',
    genre: 'Hoạt Hình',
    duration: '105 phút',
    age: 'P',
    rating: 9.0,
    basePrice: 85000,
    status: 'showing',
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm5',
    title: 'Chiến Binh Ngân Hà: Hồi Kết',
    director: 'James Gunn',
    genre: 'Khoa Học Viễn Tưởng',
    duration: '155 phút',
    age: 'C13',
    rating: 9.1,
    basePrice: 110000,
    status: 'upcoming',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm6',
    title: 'Mùa Thu Ở Paris',
    director: 'Damien Chazelle',
    genre: 'Tình Cảm',
    duration: '124 phút',
    age: 'C13',
    rating: 8.8,
    basePrice: 90000,
    status: 'ended',
    poster: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_ADMIN_SHOWTIMES: AdminShowtime[] = [
  {
    id: 'st1',
    movieTitle: 'Hành Tinh Cát: Phần Hai',
    room: 'Phòng IMAX 01',
    format: 'IMAX Laser 3D',
    time: '19:30',
    date: '2025-03-28'
  },
  {
    id: 'st2',
    movieTitle: 'Kẻ Đánh Cắp Giấc Mơ: Tái Khởi',
    room: 'Phòng Gold Class',
    format: 'Dolby Atmos 2D',
    time: '20:15',
    date: '2025-03-28'
  },
  {
    id: 'st3',
    movieTitle: 'Quỷ Ám Tầng Hầm Số 9',
    room: 'Phòng 4DX 02',
    format: '4DX Tuyệt Đỉnh',
    time: '22:00',
    date: '2025-03-28'
  },
  {
    id: 'st4',
    movieTitle: 'Vương Quốc Mây Trắng',
    room: 'Phòng Laser 03',
    format: '2D Phụ Đề',
    time: '16:30',
    date: '2025-03-28'
  }
];

export const INITIAL_ADMIN_BOOKINGS: AdminBooking[] = [
  {
    code: 'CV-893412',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    movieTitle: 'Hành Tinh Cát: Phần Hai',
    room: 'Phòng IMAX 01',
    datetime: '19:30 - 28/03/2025',
    seats: ['E5', 'E6'],
    combos: '1x Couple Combo',
    totalPaid: 349000,
    paymentMethod: 'Ví MoMo',
    status: 'active'
  },
  {
    code: 'CV-652190',
    customerName: 'Phạm Hoàng Yến',
    customerPhone: '0912345678',
    movieTitle: 'Kẻ Đánh Cắp Giấc Mơ: Tái Khởi',
    room: 'Phòng Gold Class',
    datetime: '20:15 - 28/03/2025',
    seats: ['F4', 'F5'],
    combos: '1x VIP Bucket',
    totalPaid: 405000,
    paymentMethod: 'VNPAY-QR',
    status: 'checked-in'
  },
  {
    code: 'CV-541008',
    customerName: 'Đỗ Quang Huy',
    customerPhone: '0977888999',
    movieTitle: 'Quỷ Ám Tầng Hầm Số 9',
    room: 'Phòng 4DX 02',
    datetime: '22:00 - 28/03/2025',
    seats: ['C4', 'C5'],
    combos: 'Không chọn',
    totalPaid: 190000,
    paymentMethod: 'ZaloPay',
    status: 'active'
  }
];

export const INITIAL_ADMIN_FNB: AdminFnb[] = [
  {
    id: 'cb1',
    name: 'My Combo (1 Bắp Ngọt + 1 Nước Lớn)',
    desc: '1 Bắp rang bơ Caramel size L + 1 Pepsi 32oz',
    price: 89000,
    inStock: true
  },
  {
    id: 'cb2',
    name: 'Couple Combo (1 Bắp Phô Mai + 2 Nước)',
    desc: '1 Bắp lắc Phô Mai + 2 Nước ngọt size L',
    price: 119000,
    inStock: true
  },
  {
    id: 'cb3',
    name: 'VIP IMAX Bucket (2 Bắp + 2 Nước + Snack)',
    desc: 'Tặng kèm ly giữ nhiệt IMAX phiên bản giới hạn',
    price: 175000,
    inStock: true
  }
];

export const INITIAL_ADMIN_VOUCHERS: AdminVoucher[] = [
  {
    code: 'CINEMA50',
    title: 'Ưu Đãi Bom Tấn Cuối Tuần',
    type: 'fixed',
    value: 50000,
    active: true
  },
  {
    code: 'HAPPY20',
    title: 'Thứ Tư Vui Vẻ - Giảm 20%',
    type: 'percent',
    value: 20,
    active: true
  },
  {
    code: 'VIPMEMBER',
    title: 'Tri Ân Khách Hàng VIP',
    type: 'fixed',
    value: 35000,
    active: true
  }
];

export const INITIAL_ADMIN_SOLD_SEATS = ['C4', 'C5', 'D5', 'D6', 'E5', 'E6', 'F4', 'F5'];
export const INITIAL_ADMIN_MAINT_SEATS = ['A1', 'A2', 'B10'];

