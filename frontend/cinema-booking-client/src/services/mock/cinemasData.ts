import { CinemaItem, ShowtimeSlot } from '../../types/cinema';

export const CINEMAS_DATA: CinemaItem[] = [
  {
    id: 1,
    city: 'Hà Nội',
    name: 'CINEVERSE Vincom Royal City',
    address: 'Tầng B2, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    screens: [
      { id: 1, name: 'Phòng IMAX 01', format: 'IMAX Laser 3D' },
      { id: 2, name: 'Phòng 02', format: '2D Phụ Đề' },
      { id: 3, name: 'Phòng 03', format: '3D Dolby Atmos' }
    ]
  },
  {
    id: 2,
    city: 'Hà Nội',
    name: 'CINEVERSE Metropolis Liễu Giai',
    address: 'Tầng 4, 29 Liễu Giai, Ba Đình, Hà Nội',
    screens: [
      { id: 4, name: 'Phòng 04', format: '2D Phụ Đề' },
      { id: 5, name: 'Phòng 05', format: 'Dolby Atmos' }
    ]
  },
  {
    id: 3,
    city: 'TP. Hồ Chí Minh',
    name: 'CINEVERSE Landmark 81 IMAX',
    address: 'Tầng B1, Vinhomes Central Park, Bình Thạnh, TP.HCM',
    screens: [
      { id: 6, name: 'Phòng IMAX VIP', format: 'IMAX Laser 3D' },
      { id: 7, name: 'Phòng 02', format: '2D Phụ Đề' }
    ]
  },
  {
    id: 4,
    city: 'TP. Hồ Chí Minh',
    name: 'CINEVERSE Đồng Khởi Quận 1',
    address: 'Tầng 3, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
    screens: [
      { id: 8, name: 'Phòng VIP 01', format: 'Gold Class 2D' },
      { id: 9, name: 'Phòng 02', format: '2D Phụ Đề' }
    ]
  },
  {
    id: 5,
    city: 'Đà Nẵng',
    name: 'CINEVERSE Cầu Rồng Sông Hàn',
    address: 'Tầng 4, Ngô Quyền, Sơn Trà, Đà Nẵng',
    screens: [
      { id: 10, name: 'Phòng 01', format: '2D Phụ Đề' },
      { id: 11, name: 'Phòng 02', format: '3D Dolby Atmos' }
    ]
  }
];

export const SHOWTIME_SLOTS: ShowtimeSlot[] = [
  { id: 101, time: '10:15', format: '2D Phụ Đề', room: 'Phòng 02', price: 85000 },
  { id: 102, time: '13:30', format: '2D Phụ Đề', room: 'Phòng 04', price: 85000 },
  { id: 103, time: '16:45', format: '3D Dolby Atmos', room: 'Phòng 03', price: 105000 },
  { id: 104, time: '19:30', format: 'IMAX Laser 3D', room: 'Phòng IMAX 01', price: 125000 },
  { id: 105, time: '21:45', format: 'IMAX Laser 3D', room: 'Phòng IMAX 01', price: 125000 },
  { id: 106, time: '23:15', format: '2D Phụ Đề', room: 'Phòng 05', price: 85000 }
];

export const SOLD_SEATS_PRESET: string[] = ['B4', 'B5', 'C6', 'C7', 'D5', 'D6', 'D7', 'E4', 'E5', 'F8', 'F9', 'H3', 'H4'];

