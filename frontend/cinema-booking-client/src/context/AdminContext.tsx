import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminModuleType,
  AdminUser,
  AdminMovie,
  AdminShowtime,
  AdminBooking,
  AdminFnb,
  AdminVoucher
} from '../types/admin';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_MOVIES,
  INITIAL_ADMIN_SHOWTIMES,
  INITIAL_ADMIN_BOOKINGS,
  INITIAL_ADMIN_FNB,
  INITIAL_ADMIN_VOUCHERS,
  INITIAL_ADMIN_SOLD_SEATS,
  INITIAL_ADMIN_MAINT_SEATS
} from '../services/mock/adminData';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'CINEVERSE_STANDALONE_ADMIN_V1';

interface AdminContextValue {
  currentModule: AdminModuleType;
  mobileSidebarOpen: boolean;
  users: AdminUser[];
  movies: AdminMovie[];
  showtimes: AdminShowtime[];
  bookings: AdminBooking[];
  fnb: AdminFnb[];
  vouchers: AdminVoucher[];
  soldSeats: string[];
  maintSeats: string[];
  bookingFilter: 'all' | 'active' | 'checked-in' | 'cancelled';
  userModal: { isOpen: boolean; editingUser: AdminUser | null };
  movieModal: { isOpen: boolean; editingMovie: AdminMovie | null };
  ticketModal: { isOpen: boolean; ticket: AdminBooking | null };
  switchModule: (mod: AdminModuleType) => void;
  toggleMobileSidebar: () => void;
  setBookingFilter: (filter: 'all' | 'active' | 'checked-in' | 'cancelled') => void;
  saveUser: (data: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserLock: (id: string) => void;
  saveMovie: (data: Partial<AdminMovie>) => void;
  deleteMovie: (id: string) => void;
  createShowtime: (data: Omit<AdminShowtime, 'id'>) => void;
  deleteShowtime: (id: string) => void;
  toggleSeatMaintenance: (code: string) => void;
  unlockAllMaintenanceSeats: () => void;
  checkInBooking: (code: string) => void;
  cancelBooking: (code: string) => void;
  addFnb: (name: string, price: number, desc: string) => void;
  toggleFnbStock: (id: string) => void;
  deleteFnb: (id: string) => void;
  addVoucher: (code: string, title: string, type: 'fixed' | 'percent', value: number) => void;
  toggleVoucherActive: (code: string) => void;
  deleteVoucher: (code: string) => void;
  resetDatabase: () => void;
  simulateBooking: () => void;
  openUserModal: (user?: AdminUser) => void;
  closeUserModal: () => void;
  openMovieModal: (movie?: AdminMovie) => void;
  closeMovieModal: () => void;
  openTicketModal: (ticket: AdminBooking) => void;
  closeTicketModal: () => void;
  kpis: {
    totalRevenue: number;
    totalTickets: number;
    checkedInCount: number;
    totalUsers: number;
    activeUsersCount: number;
    occupancyPercent: number;
  };
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [currentModule, setCurrentModule] = useState<AdminModuleType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'checked-in' | 'cancelled'>('all');

  const [userModal, setUserModal] = useState<{ isOpen: boolean; editingUser: AdminUser | null }>({
    isOpen: false,
    editingUser: null
  });
  const [movieModal, setMovieModal] = useState<{ isOpen: boolean; editingMovie: AdminMovie | null }>({
    isOpen: false,
    editingMovie: null
  });
  const [ticketModal, setTicketModal] = useState<{ isOpen: boolean; ticket: AdminBooking | null }>({
    isOpen: false,
    ticket: null
  });

  // DB datasets
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.users) return parsed.users;
      } catch {}
    }
    return INITIAL_ADMIN_USERS;
  });

  const [movies, setMovies] = useState<AdminMovie[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.movies) return parsed.movies;
      } catch {}
    }
    return INITIAL_ADMIN_MOVIES;
  });

  const [showtimes, setShowtimes] = useState<AdminShowtime[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.showtimes) return parsed.showtimes;
      } catch {}
    }
    return INITIAL_ADMIN_SHOWTIMES;
  });

  const [bookings, setBookings] = useState<AdminBooking[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.bookings) return parsed.bookings;
      } catch {}
    }
    return INITIAL_ADMIN_BOOKINGS;
  });

  const [fnb, setFnb] = useState<AdminFnb[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.fnb) return parsed.fnb;
      } catch {}
    }
    return INITIAL_ADMIN_FNB;
  });

  const [vouchers, setVouchers] = useState<AdminVoucher[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.vouchers) return parsed.vouchers;
      } catch {}
    }
    return INITIAL_ADMIN_VOUCHERS;
  });

  const [soldSeats, setSoldSeats] = useState<string[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.soldSeats) return parsed.soldSeats;
      } catch {}
    }
    return INITIAL_ADMIN_SOLD_SEATS;
  });

  const [maintSeats, setMaintSeats] = useState<string[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.maintSeats) return parsed.maintSeats;
      } catch {}
    }
    return INITIAL_ADMIN_MAINT_SEATS;
  });

  // Persist DB state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          movies,
          showtimes,
          bookings,
          fnb,
          vouchers,
          soldSeats,
          maintSeats
        })
      );
    } catch {}
  }, [users, movies, showtimes, bookings, fnb, vouchers, soldSeats, maintSeats]);

  const switchModule = useCallback((mod: AdminModuleType) => {
    setCurrentModule(mod);
    setMobileSidebarOpen(false);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  // CRUD User
  const saveUser = useCallback((data: Partial<AdminUser>) => {
    if (data.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === data.id ? { ...u, ...(data as AdminUser) } : u))
      );
      showToast('Đã cập nhật thông tin người dùng thành công!', 'success');
    } else {
      const newUser: AdminUser = {
        id: 'u_' + Date.now(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role || 'Thành viên',
        points: Number(data.points) || 150,
        joined: new Date().toLocaleDateString('vi-VN'),
        status: data.status || 'active'
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast('Đã thêm người dùng mới thành công!', 'success');
    }
    setUserModal({ isOpen: false, editingUser: null });
  }, [showToast]);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('Đã xóa người dùng khỏi hệ thống.', 'info');
  }, [showToast]);

  const toggleUserLock = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'locked' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('Đã cập nhật trạng thái tài khoản.', 'info');
  }, [showToast]);

  // CRUD Movie
  const saveMovie = useCallback((data: Partial<AdminMovie>) => {
    if (data.id) {
      setMovies((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, ...(data as AdminMovie) } : m))
      );
      showToast('Đã cập nhật thông tin phim!', 'success');
    } else {
      const newMovie: AdminMovie = {
        id: 'm_' + Date.now(),
        title: data.title || '',
        director: data.director || '',
        genre: data.genre || 'Hành Động',
        duration: data.duration || '120 phút',
        age: data.age || 'C16',
        rating: Number(data.rating) || 9.0,
        basePrice: Number(data.basePrice) || 95000,
        status: data.status || 'showing',
        poster: data.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
      };
      setMovies((prev) => [newMovie, ...prev]);
      showToast('Đã phát hành phim mới vào danh mục!', 'success');
    }
    setMovieModal({ isOpen: false, editingMovie: null });
  }, [showToast]);

  const deleteMovie = useCallback((id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
    showToast('Đã xóa phim khỏi danh mục.', 'info');
  }, [showToast]);

  // Showtime & Seats
  const createShowtime = useCallback((data: Omit<AdminShowtime, 'id'>) => {
    const newSt: AdminShowtime = {
      id: 'st_' + Date.now(),
      ...data
    };
    setShowtimes((prev) => [newSt, ...prev]);
    showToast(`Đã tạo suất chiếu mới: ${data.movieTitle} (${data.time})`, 'success');
  }, [showToast]);

  const deleteShowtime = useCallback((id: string) => {
    setShowtimes((prev) => prev.filter((s) => s.id !== id));
    showToast('Đã hủy suất chiếu thành công.', 'info');
  }, [showToast]);

  const toggleSeatMaintenance = useCallback((code: string) => {
    setMaintSeats((prevMaint) => {
      const isMaint = prevMaint.includes(code);
      if (isMaint) {
        // From maint -> move to sold
        setSoldSeats((prevSold) => [...prevSold.filter((s) => s !== code), code]);
        return prevMaint.filter((s) => s !== code);
      } else {
        // If it was sold, clear from sold and leave open
        setSoldSeats((prevSold) => {
          const isSold = prevSold.includes(code);
          if (isSold) {
            return prevSold.filter((s) => s !== code);
          }
          return prevSold;
        });
        return [...prevMaint, code];
      }
    });
  }, []);

  const unlockAllMaintenanceSeats = useCallback(() => {
    setMaintSeats([]);
    showToast('Đã mở khóa bảo trì tất cả các ghế phòng chiếu!', 'success');
  }, [showToast]);

  // Bookings
  const checkInBooking = useCallback((code: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.code === code ? { ...b, status: 'checked-in' } : b))
    );
    showToast(`Check-in thành công mã vé ${code}! Cho phép khách vào phòng chiếu.`, 'success');
  }, [showToast]);

  const cancelBooking = useCallback((code: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.code === code ? { ...b, status: 'cancelled' } : b))
    );
    showToast(`Đã hủy đơn vé ${code}.`, 'info');
  }, [showToast]);

  // FNB & Vouchers
  const addFnb = useCallback((name: string, price: number, desc: string) => {
    const newItem: AdminFnb = {
      id: 'cb_' + Date.now(),
      name,
      price,
      desc,
      inStock: true
    };
    setFnb((prev) => [...prev, newItem]);
    showToast(`Đã thêm combo bắp nước: ${name}`, 'success');
  }, [showToast]);

  const toggleFnbStock = useCallback((id: string) => {
    setFnb((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  }, []);

  const deleteFnb = useCallback((id: string) => {
    setFnb((prev) => prev.filter((item) => item.id !== id));
    showToast('Đã xóa combo bắp nước.', 'info');
  }, [showToast]);

  const addVoucher = useCallback((code: string, title: string, type: 'fixed' | 'percent', value: number) => {
    const newVc: AdminVoucher = {
      code: code.toUpperCase().trim(),
      title,
      type,
      value,
      active: true
    };
    setVouchers((prev) => [...prev, newVc]);
    showToast(`Đã phát hành mã giảm giá ${newVc.code}`, 'success');
  }, [showToast]);

  const toggleVoucherActive = useCallback((code: string) => {
    setVouchers((prev) =>
      prev.map((vc) => (vc.code === code ? { ...vc, active: !vc.active } : vc))
    );
  }, []);

  const deleteVoucher = useCallback((code: string) => {
    setVouchers((prev) => prev.filter((vc) => vc.code !== code));
    showToast('Đã xóa voucher.', 'info');
  }, [showToast]);

  // Simulation
  const simulateBooking = useCallback(() => {
    const randomCode = 'CV-' + Math.floor(100000 + Math.random() * 900000);
    const movie = movies[Math.floor(Math.random() * movies.length)] || movies[0];
    const user = users[Math.floor(Math.random() * users.length)] || users[0];
    const rows = ['B', 'C', 'D', 'E', 'F'];
    const row = rows[Math.floor(Math.random() * rows.length)];
    const seat1 = `${row}${Math.floor(Math.random() * 5 + 1)}`;
    const seat2 = `${row}${Math.floor(Math.random() * 4 + 6)}`;

    const newBooking: AdminBooking = {
      code: randomCode,
      customerName: user.name,
      customerPhone: user.phone,
      movieTitle: movie.title,
      room: 'Phòng IMAX 01',
      datetime: '20:15 - Hôm nay',
      seats: [seat1, seat2],
      combos: '1x Couple Combo',
      totalPaid: movie.basePrice * 2 + 119000,
      paymentMethod: 'Ví MoMo',
      status: 'active'
    };

    setBookings((prev) => [newBooking, ...prev]);
    setSoldSeats((prev) => [...prev, seat1, seat2]);
    showToast(`[Giả lập] Khách hàng ${user.name} vừa đặt thành công đơn vé ${randomCode}!`, 'success');
  }, [movies, users, showToast]);

  const resetDatabase = useCallback(() => {
    setUsers(JSON.parse(JSON.stringify(INITIAL_ADMIN_USERS)));
    setMovies(JSON.parse(JSON.stringify(INITIAL_ADMIN_MOVIES)));
    setShowtimes(JSON.parse(JSON.stringify(INITIAL_ADMIN_SHOWTIMES)));
    setBookings(JSON.parse(JSON.stringify(INITIAL_ADMIN_BOOKINGS)));
    setFnb(JSON.parse(JSON.stringify(INITIAL_ADMIN_FNB)));
    setVouchers(JSON.parse(JSON.stringify(INITIAL_ADMIN_VOUCHERS)));
    setSoldSeats([...INITIAL_ADMIN_SOLD_SEATS]);
    setMaintSeats([...INITIAL_ADMIN_MAINT_SEATS]);
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu mặc định!', 'info');
  }, [showToast]);

  // Modals
  const openUserModal = useCallback((user?: AdminUser) => {
    setUserModal({ isOpen: true, editingUser: user || null });
  }, []);

  const closeUserModal = useCallback(() => {
    setUserModal({ isOpen: false, editingUser: null });
  }, []);

  const openMovieModal = useCallback((movie?: AdminMovie) => {
    setMovieModal({ isOpen: true, editingMovie: movie || null });
  }, []);

  const closeMovieModal = useCallback(() => {
    setMovieModal({ isOpen: false, editingMovie: null });
  }, []);

  const openTicketModal = useCallback((ticket: AdminBooking) => {
    setTicketModal({ isOpen: true, ticket });
  }, []);

  const closeTicketModal = useCallback(() => {
    setTicketModal({ isOpen: false, ticket: null });
  }, []);

  // KPIs
  const totalRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPaid, 0);

  const validBookings = bookings.filter((b) => b.status !== 'cancelled');
  const checkedInCount = bookings.filter((b) => b.status === 'checked-in').length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;

  const totalSeats = 75; // 7 rows x 10 + 5 doubles
  const occupiedSeatsCount = soldSeats.length;
  const occupancyPercent = Math.min(100, Math.round((occupiedSeatsCount / totalSeats) * 100));

  return (
    <AdminContext.Provider
      value={{
        currentModule,
        mobileSidebarOpen,
        users,
        movies,
        showtimes,
        bookings,
        fnb,
        vouchers,
        soldSeats,
        maintSeats,
        bookingFilter,
        userModal,
        movieModal,
        ticketModal,
        switchModule,
        toggleMobileSidebar,
        setBookingFilter,
        saveUser,
        deleteUser,
        toggleUserLock,
        saveMovie,
        deleteMovie,
        createShowtime,
        deleteShowtime,
        toggleSeatMaintenance,
        unlockAllMaintenanceSeats,
        checkInBooking,
        cancelBooking,
        addFnb,
        toggleFnbStock,
        deleteFnb,
        addVoucher,
        toggleVoucherActive,
        deleteVoucher,
        resetDatabase,
        simulateBooking,
        openUserModal,
        closeUserModal,
        openMovieModal,
        closeMovieModal,
        openTicketModal,
        closeTicketModal,
        kpis: {
          totalRevenue,
          totalTickets: validBookings.length,
          checkedInCount,
          totalUsers: users.length,
          activeUsersCount,
          occupancyPercent
        }
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

