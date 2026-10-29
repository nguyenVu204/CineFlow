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
import { useToast } from './ToastContext';
import { authApi } from '../services/api/authApi';
import { movieApi } from '../services/api/movieApi';
import { cinemaApi } from '../services/api/cinemaApi';
import { bookingApi } from '../services/api/bookingApi';
import { concessionApi } from '../services/api/concessionApi';
import { promotionApi } from '../services/api/promotionApi';

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

  // DB datasets loaded from Backend
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [showtimes, setShowtimes] = useState<AdminShowtime[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [fnb, setFnb] = useState<AdminFnb[]>([]);
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [soldSeats, setSoldSeats] = useState<string[]>([]);
  const [maintSeats, setMaintSeats] = useState<string[]>([]);

  // Initial data loading from Backend APIs
  useEffect(() => {
    let mounted = true;

    Promise.all([
      authApi.getUsers(),
      movieApi.getAdminMovies(),
      cinemaApi.getAdminShowtimes(),
      bookingApi.getAdminBookings(),
      concessionApi.getAdminFnb(),
      promotionApi.getPromotions()
    ])
      .then(([u, m, s, b, f, v]) => {
        if (!mounted) return;
        setUsers(u);
        setMovies(m);

        // Enrich showtimes with movie title if available
        const enrichedShowtimes = s.map((st) => {
          const match = m.find((mv) => st.movieTitle.includes(mv.id));
          return match ? { ...st, movieTitle: match.title } : st;
        });
        setShowtimes(enrichedShowtimes);
        setBookings(b);
        setFnb(f);
        setVouchers(v);
      })
      .catch((err) => {
        console.error('Error fetching admin data from backend:', err);
      });

    // Seat availability for room inspection (showtime #1)
    const getSeatCode = (seatId: number) => {
      const rowIdx = Math.floor((seatId - 1) / 10);
      const col = ((seatId - 1) % 10) + 1;
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      return `${rows[rowIdx] || 'A'}${col}`;
    };

    bookingApi
      .getSeatAvailability(1)
      .then((seats) => {
        if (!mounted || !seats || seats.length === 0) return;
        const sold = seats
          .filter((s) => s.status === 'Held' || s.status === 'Booked')
          .map((s) => getSeatCode(s.seatId));
        const maint = seats
          .filter((s) => s.status === 'Maintenance')
          .map((s) => getSeatCode(s.seatId));
        setSoldSeats(sold);
        setMaintSeats(maint);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const switchModule = useCallback((mod: AdminModuleType) => {
    setCurrentModule(mod);
    setMobileSidebarOpen(false);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  // CRUD User
  const saveUser = useCallback(
    async (data: Partial<AdminUser>) => {
      if (data.id) {
        try {
          await authApi.updateUser(data.id, {
            displayName: data.name || '',
            phoneNumber: data.phone,
            role:
              data.role === 'Quản trị viên'
                ? 'Admin'
                : data.role === 'Nhân viên soát vé'
                ? 'Staff'
                : data.role === 'Khách hàng VIP'
                ? 'VIP'
                : 'Customer',
            points: data.points
          });
          setUsers((prev) =>
            prev.map((u) => (u.id === data.id ? { ...u, ...(data as AdminUser) } : u))
          );
          showToast('Đã cập nhật thông tin người dùng thành công!', 'success');
        } catch {
          showToast('Lỗi khi cập nhật người dùng.', 'error');
        }
      } else {
        try {
          const created = await authApi.createUser({
            displayName: data.name || 'Người dùng',
            email: data.email || `user${Date.now()}@cineverse.vn`,
            password: 'Password@123',
            phoneNumber: data.phone || '0988123456',
            role:
              data.role === 'Quản trị viên'
                ? 'Admin'
                : data.role === 'Nhân viên soát vé'
                ? 'Staff'
                : data.role === 'Khách hàng VIP'
                ? 'VIP'
                : 'Customer',
            points: Number(data.points) || 150
          });
          const newUser: AdminUser = {
            id: created.id,
            name: created.displayName,
            email: created.email,
            phone: created.phoneNumber || '0988123456',
            role: data.role || 'Thành viên',
            points: created.points || 150,
            joined: new Date().toLocaleDateString('vi-VN'),
            status: created.status || 'active'
          };
          setUsers((prev) => [newUser, ...prev]);
          showToast('Đã thêm người dùng mới thành công!', 'success');
        } catch {
          showToast('Lỗi khi thêm người dùng mới.', 'error');
        }
      }
      setUserModal({ isOpen: false, editingUser: null });
    },
    [showToast]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await authApi.deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast('Đã xóa người dùng khỏi hệ thống.', 'info');
      } catch {
        showToast('Lỗi khi xóa người dùng.', 'error');
      }
    },
    [showToast]
  );

  const toggleUserLock = useCallback(
    async (id: string) => {
      const target = users.find((u) => u.id === id);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'locked' : 'active';
      try {
        await authApi.updateUserStatus(id, nextStatus);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
        );
        showToast(
          `Đã ${nextStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản người dùng.`,
          'info'
        );
      } catch {
        showToast('Lỗi khi cập nhật trạng thái tài khoản.', 'error');
      }
    },
    [users, showToast]
  );

  // CRUD Movie
  const saveMovie = useCallback(
    async (data: Partial<AdminMovie>) => {
      if (data.id) {
        try {
          await movieApi.updateMovie(data.id, data);
          setMovies((prev) =>
            prev.map((m) => (m.id === data.id ? { ...m, ...(data as AdminMovie) } : m))
          );
          showToast('Đã cập nhật thông tin phim!', 'success');
        } catch {
          showToast('Lỗi khi cập nhật phim.', 'error');
        }
      } else {
        try {
          const created = await movieApi.createMovie(data);
          const ageVal: 'P' | 'C13' | 'C16' | 'C18' =
            (created.ageRating as any) || data.age || 'C16';
          const newMovie: AdminMovie = {
            id: created.id.toString(),
            title: created.title,
            director: created.director || data.director || '',
            genre: created.genre,
            duration: `${created.durationMinutes} phút`,
            age: ageVal,
            rating: created.rating ?? data.rating ?? 9.0,
            basePrice: Number(data.basePrice) || 95000,
            status: data.status || 'showing',
            poster: created.posterUrl || data.poster || ''
          };
          setMovies((prev) => [newMovie, ...prev]);
          showToast('Đã phát hành phim mới vào danh mục!', 'success');
        } catch {
          showToast('Lỗi khi phát hành phim mới.', 'error');
        }
      }
      setMovieModal({ isOpen: false, editingMovie: null });
    },
    [showToast]
  );

  const deleteMovie = useCallback(
    async (id: string) => {
      try {
        await movieApi.deleteMovie(id);
        setMovies((prev) => prev.filter((m) => m.id !== id));
        showToast('Đã xóa phim khỏi danh mục.', 'info');
      } catch {
        showToast('Lỗi khi xóa phim.', 'error');
      }
    },
    [showToast]
  );

  // Showtime & Seats
  const createShowtime = useCallback(
    async (data: Omit<AdminShowtime, 'id'>) => {
      const matchedMovie = movies.find((m) => m.title === data.movieTitle) || movies[0];
      const movieId = matchedMovie ? parseInt(matchedMovie.id, 10) : 1;
      const screenId = data.room.includes('02') ? 2 : data.room.includes('Gold') ? 3 : 1;
      const startTime = `${data.date}T${data.time}:00Z`;
      const endTime = `${data.date}T${(parseInt(data.time.split(':')[0], 10) + 2)
        .toString()
        .padStart(2, '0')}:${data.time.split(':')[1]}:00Z`;

      try {
        const created = await cinemaApi.createShowtime({
          movieId,
          screenId,
          startTime,
          endTime,
          basePrice: 95000
        });

        const newSt: AdminShowtime = {
          id: created.id.toString(),
          movieTitle: data.movieTitle,
          room: data.room,
          format: data.format,
          time: data.time,
          date: data.date
        };
        setShowtimes((prev) => [newSt, ...prev]);
        showToast(`Đã tạo suất chiếu mới: ${data.movieTitle} (${data.time})`, 'success');
      } catch {
        showToast('Lỗi khi tạo suất chiếu.', 'error');
      }
    },
    [movies, showToast]
  );

  const deleteShowtime = useCallback(
    async (id: string) => {
      try {
        await cinemaApi.deleteShowtime(id);
        setShowtimes((prev) => prev.filter((s) => s.id !== id));
        showToast('Đã hủy suất chiếu thành công.', 'info');
      } catch {
        showToast('Lỗi khi hủy suất chiếu.', 'error');
      }
    },
    [showToast]
  );

  const toggleSeatMaintenance = useCallback(
    async (code: string) => {
      const showtimeId = showtimes.length > 0 ? parseInt(showtimes[0].id, 10) : 1;
      const isMaint = maintSeats.includes(code);
      const seatIdMatch = code.match(/^[A-G](\d+)$/);
      const seatNum = seatIdMatch ? parseInt(seatIdMatch[1], 10) : 1;
      const rowOffset = (code.charCodeAt(0) - 65) * 10;
      const seatId = rowOffset + seatNum;

      try {
        await bookingApi.toggleSeatMaintenance(showtimeId, seatId, !isMaint);
        setMaintSeats((prev) =>
          isMaint ? prev.filter((s) => s !== code) : [...prev, code]
        );
        showToast(`Đã ${isMaint ? 'mở khóa' : 'khóa bảo trì'} ghế ${code}.`, 'info');
      } catch {
        setMaintSeats((prev) =>
          isMaint ? prev.filter((s) => s !== code) : [...prev, code]
        );
      }
    },
    [showtimes, maintSeats, showToast]
  );

  const unlockAllMaintenanceSeats = useCallback(async () => {
    const showtimeId = showtimes.length > 0 ? parseInt(showtimes[0].id, 10) : 1;
    try {
      await bookingApi.unlockAllMaintenance(showtimeId);
    } catch {}
    setMaintSeats([]);
    showToast('Đã mở khóa bảo trì tất cả các ghế phòng chiếu!', 'success');
  }, [showtimes, showToast]);

  // Bookings
  const checkInBooking = useCallback(
    async (code: string) => {
      try {
        const res = await bookingApi.checkInTicket(code);
        setBookings((prev) =>
          prev.map((b) => (b.code === code ? { ...b, status: 'checked-in' } : b))
        );
        showToast(
          `Check-in thành công mã vé ${code}! Khách: ${res.customerName} - Ghế: ${res.seatNumbers.join(', ')}.`,
          'success'
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Lỗi check-in vé';
        showToast(msg, 'error');
      }
    },
    [showToast]
  );

  const cancelBooking = useCallback(
    async (code: string) => {
      setBookings((prev) =>
        prev.map((b) => (b.code === code ? { ...b, status: 'cancelled' } : b))
      );
      showToast(`Đã hủy đơn vé ${code}.`, 'info');
    },
    [showToast]
  );

  // FNB & Vouchers
  const addFnb = useCallback(
    async (name: string, price: number, desc: string) => {
      try {
        const newItem = await concessionApi.createConcession({
          name,
          description: desc,
          price,
          inStock: true
        });
        setFnb((prev) => [...prev, newItem]);
        showToast(`Đã thêm combo bắp nước: ${name}`, 'success');
      } catch {
        showToast('Lỗi khi thêm combo bắp nước.', 'error');
      }
    },
    [showToast]
  );

  const toggleFnbStock = useCallback(
    async (id: string) => {
      try {
        const updated = await concessionApi.toggleStock(id);
        setFnb((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, inStock: updated.inStock } : item
          )
        );
        showToast('Đã cập nhật trạng thái kho bắp nước.', 'info');
      } catch {
        showToast('Lỗi khi cập nhật tồn kho.', 'error');
      }
    },
    [showToast]
  );

  const deleteFnb = useCallback(
    async (id: string) => {
      try {
        await concessionApi.deleteConcession(id);
        setFnb((prev) => prev.filter((item) => item.id !== id));
        showToast('Đã xóa combo bắp nước.', 'info');
      } catch {
        showToast('Lỗi khi xóa combo bắp nước.', 'error');
      }
    },
    [showToast]
  );

  const addVoucher = useCallback(
    async (
      code: string,
      title: string,
      type: 'fixed' | 'percent',
      value: number
    ) => {
      try {
        const newVc = await promotionApi.createPromotion({
          code: code.toUpperCase().trim(),
          title,
          discountType: type,
          discountValue: value,
          isActive: true
        });
        setVouchers((prev) => [...prev, newVc]);
        showToast(`Đã phát hành mã giảm giá ${newVc.code}`, 'success');
      } catch {
        showToast('Lỗi khi tạo mã giảm giá.', 'error');
      }
    },
    [showToast]
  );

  const toggleVoucherActive = useCallback(
    async (code: string) => {
      try {
        const updated = await promotionApi.togglePromotion(code);
        setVouchers((prev) =>
          prev.map((vc) => (vc.code === code ? { ...vc, active: updated.active } : vc))
        );
        showToast(`Đã cập nhật trạng thái voucher ${code}.`, 'info');
      } catch {
        showToast('Lỗi khi cập nhật trạng thái voucher.', 'error');
      }
    },
    [showToast]
  );

  const deleteVoucher = useCallback(
    async (code: string) => {
      try {
        await promotionApi.deletePromotion(code);
        setVouchers((prev) => prev.filter((vc) => vc.code !== code));
        showToast('Đã xóa voucher khỏi hệ thống.', 'info');
      } catch {
        showToast('Lỗi khi xóa voucher.', 'error');
      }
    },
    [showToast]
  );

  // Simulation
  const simulateBooking = useCallback(async () => {
    try {
      const rows = ['B', 'C', 'D', 'E'];
      const r = rows[Math.floor(Math.random() * rows.length)];
      const seat1 = `${r}5`;
      const seat2 = `${r}6`;
      const user = users[0];
      const customerName = user ? user.name : 'Khách vãng lai';
      const customerPhone = user ? user.phone : '0988123456';

      const holdRes = await bookingApi.holdSeats({
        showtimeId: 1,
        seatIds: [15, 16],
        concessions: [{ concessionId: 1, quantity: 1 }],
        promoCode: 'CINEVERSE2025',
        customerName,
        customerPhone,
        paymentMethod: 'MoMo'
      });

      const confirmRes = await bookingApi.confirmBooking(holdRes.bookingId);
      showToast(
        `[Giả lập] Đặt vé thành công mã ${confirmRes.bookingCode}! Cho khách ${customerName}`,
        'success'
      );

      const updatedBookings = await bookingApi.getAdminBookings();
      setBookings(updatedBookings);
      setSoldSeats((prev) => [...prev, seat1, seat2]);
    } catch (err: any) {
      showToast('Lỗi mô phỏng đặt vé: ' + (err.message || 'Lỗi server'), 'error');
    }
  }, [users, showToast]);

  const resetDatabase = useCallback(async () => {
    try {
      const [u, m, s, b, f, v] = await Promise.all([
        authApi.getUsers(),
        movieApi.getAdminMovies(),
        cinemaApi.getAdminShowtimes(),
        bookingApi.getAdminBookings(),
        concessionApi.getAdminFnb(),
        promotionApi.getPromotions()
      ]);
      setUsers(u);
      setMovies(m);
      setShowtimes(s);
      setBookings(b);
      setFnb(f);
      setVouchers(v);
      showToast('Đã đồng bộ lại toàn bộ dữ liệu mới nhất từ backend!', 'info');
    } catch {
      showToast('Lỗi khi tải lại dữ liệu từ backend.', 'error');
    }
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
    setUserModal((prev) => ({ ...prev })); // noop
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
  const occupancyPercent = Math.min(
    100,
    Math.round((occupiedSeatsCount / totalSeats) * 100)
  );

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
