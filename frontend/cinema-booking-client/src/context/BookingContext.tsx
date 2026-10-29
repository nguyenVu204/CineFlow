import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MovieItem } from '../types/movie';
import { CinemaItem, ShowtimeSlot } from '../types/cinema';
import { SelectedSeatInfo, TicketRecord } from '../types/booking';
import { ConcessionItem } from '../types/concession';
import { movieApi } from '../services/api/movieApi';
import { cinemaApi } from '../services/api/cinemaApi';
import { concessionApi } from '../services/api/concessionApi';
import { promotionApi } from '../services/api/promotionApi';
import { bookingApi } from '../services/api/bookingApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export type ViewType = 'home' | 'detail' | 'seats' | 'checkout' | 'mytickets' | 'admin';

interface BookingData {
  movie: MovieItem;
  cinema: CinemaItem;
  dateStr: string;
  time: string;
  format: string;
  room: string;
  showtimeId?: number;
  seats: SelectedSeatInfo[];
  combos: Record<string, number>;
  promoCode: string;
  discountAmount: number;
  paymentMethod: 'momo' | 'vnpay' | 'zalopay' | 'visa';
  customerName: string;
  customerPhone: string;
  backendBookingId?: number;
  bookingCode?: string;
}

interface BookingContextValue {
  currentView: ViewType;
  selectedMovieId: number;
  selectedDateIndex: number;
  selectedCity: string;
  booking: BookingData;
  concessions: ConcessionItem[];
  myTickets: TicketRecord[];
  lastConfirmedTicket: TicketRecord | null;
  trailerModalMovie: MovieItem | null;
  ticketQrModalData: TicketRecord | null;
  seatHoldSeconds: number;
  navigateTo: (view: ViewType) => void;
  openMovieDetail: (id: number) => void;
  selectDate: (index: number) => void;
  selectCity: (city: string) => void;
  selectShowtimeAndGoToSeats: (slot: ShowtimeSlot, cinema: CinemaItem) => void;
  quickBook: (movieId: number, cinemaId: number, dateStr: string, time: string) => void;
  toggleSeat: (seat: SelectedSeatInfo) => void;
  updateComboQty: (comboId: string, delta: number) => void;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  setPaymentMethod: (method: 'momo' | 'vnpay' | 'zalopay' | 'visa') => void;
  setCustomerInfo: (name: string, phone: string) => void;
  proceedToCheckout: () => Promise<void>;
  confirmPayment: () => Promise<TicketRecord | null>;
  cancelTicket: (code: string) => Promise<void>;
  openTrailer: (movie: MovieItem) => void;
  closeTrailer: () => void;
  openTicketQr: (ticket: TicketRecord) => void;
  closeTicketQr: () => void;
  calculateTotals: () => {
    ticketTotal: number;
    comboTotal: number;
    discount: number;
    finalTotal: number;
  };
}

const defaultMovie: MovieItem = {
  id: 1,
  title: 'Hành Tinh Cát: Phần Hai',
  originalTitle: 'Dune: Part Two',
  status: 'showing',
  genre: 'Khoa Học Viễn Tưởng',
  duration: 166,
  releaseDate: '15/03/2025',
  rating: 9.4,
  ageRating: 'C16',
  director: 'Denis Villeneuve',
  cast: 'Timothée Chalamet, Zendaya',
  formats: ['IMAX Laser', '2D Phụ Đề'],
  poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
  synopsis: 'Paul Atreides hợp nhất với tộc người Fremen và bắt đầu hành trình trả thù...',
  trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w'
};

const defaultCinema: CinemaItem = {
  id: 1,
  name: 'CINEVERSE Vincom Royal City',
  address: 'Tầng B2, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
  city: 'Hà Nội',
  screens: []
};

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addPoints } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<number>(1);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<string>('Hà Nội');
  const [moviesList, setMoviesList] = useState<MovieItem[]>([]);
  const [cinemasList, setCinemasList] = useState<CinemaItem[]>([]);
  const [concessions, setConcessions] = useState<ConcessionItem[]>([]);

  const [booking, setBooking] = useState<BookingData>({
    movie: defaultMovie,
    cinema: defaultCinema,
    dateStr: 'Hôm nay',
    time: '19:30',
    format: 'IMAX Laser 3D',
    room: 'Phòng IMAX 01',
    showtimeId: 1,
    seats: [],
    combos: {},
    promoCode: '',
    discountAmount: 0,
    paymentMethod: 'momo',
    customerName: '',
    customerPhone: ''
  });

  const [myTickets, setMyTickets] = useState<TicketRecord[]>(() => {
    const saved = localStorage.getItem('cineverse_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [lastConfirmedTicket, setLastConfirmedTicket] = useState<TicketRecord | null>(null);
  const [trailerModalMovie, setTrailerModalMovie] = useState<MovieItem | null>(null);
  const [ticketQrModalData, setTicketQrModalData] = useState<TicketRecord | null>(null);
  const [seatHoldSeconds, setSeatHoldSeconds] = useState<number>(300);

  // Initial load of movies, cinemas, and concessions from Backend
  useEffect(() => {
    let mounted = true;
    movieApi.getMovies().then((data) => {
      if (mounted && data.length > 0) {
        setMoviesList(data);
        setSelectedMovieId(data[0].id);
        setBooking((prev) => ({ ...prev, movie: data[0] }));
      }
    });

    cinemaApi.getCinemas().then((data) => {
      if (mounted && data.length > 0) {
        setCinemasList(data);
        setBooking((prev) => ({ ...prev, cinema: data[0] }));
      }
    });

    concessionApi.getConcessions(true).then((data) => {
      if (mounted && data.length > 0) {
        setConcessions(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch my bookings from backend if logged in
  useEffect(() => {
    if (user?.token) {
      bookingApi.getMyBookings().then((backendBookings) => {
        if (backendBookings && backendBookings.length > 0) {
          const tickets: TicketRecord[] = backendBookings.map((b) => {
            const d = new Date(b.createdAt);
            const dateStr = d.toLocaleDateString('vi-VN');
            const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            const seats: SelectedSeatInfo[] = b.items.map((i) => ({
              seatId: i.seatId,
              code: i.seatNumber,
              row: i.seatNumber.charAt(0),
              type: i.seatNumber.startsWith('H') ? 'sweetbox' : ['D', 'E', 'F', 'G'].includes(i.seatNumber.charAt(0)) ? 'vip' : 'standard',
              price: i.price
            }));
            const combos: Record<string, number> = {};
            (b.concessions || []).forEach((c) => {
              combos[c.concessionId.toString()] = c.quantity;
            });

            return {
              id: 'b_' + b.id,
              bookingId: b.id,
              bookingCode: b.bookingCode,
              movie: defaultMovie,
              cinema: defaultCinema,
              dateStr,
              time,
              format: '2D Phụ Đề',
              room: 'Phòng chiếu',
              seats,
              combos,
              totalPaid: b.totalAmount,
              paymentMethod: b.paymentMethod || 'Ví MoMo',
              status: b.status === 'Cancelled' ? 'cancelled' : b.status === 'CheckedIn' ? 'checked-in' : 'valid',
              createdAt: b.createdAt
            };
          });
          setMyTickets(tickets);
        }
      }).catch(() => {});
    }
  }, [user?.token]);

  // Sync tickets with localStorage
  useEffect(() => {
    localStorage.setItem('cineverse_tickets', JSON.stringify(myTickets));
  }, [myTickets]);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setBooking((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name,
        customerPhone: prev.customerPhone || user.phone || '0988123456'
      }));
    }
  }, [user]);

  // Seat hold countdown timer when on checkout
  useEffect(() => {
    if (currentView !== 'checkout') return;

    setSeatHoldSeconds(300);
    const interval = setInterval(() => {
      setSeatHoldSeconds((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          showToast('Thời gian giữ ghế đã hết hạn! Vui lòng chọn lại ghế.', 'error');
          setCurrentView('seats');
          return 300;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, showToast]);

  const navigateTo = useCallback((view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openMovieDetail = useCallback((id: number) => {
    setSelectedMovieId(id);
    const found = moviesList.find((m) => m.id === id) || defaultMovie;
    setBooking((prev) => ({
      ...prev,
      movie: found
    }));
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [moviesList]);

  const selectDate = useCallback((index: number) => {
    setSelectedDateIndex(index);
    const today = new Date();
    today.setDate(today.getDate() + index);
    const dateStr = index === 0 ? 'Hôm nay' : today.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    setBooking((prev) => ({ ...prev, dateStr }));
  }, []);

  const selectCity = useCallback((city: string) => {
    setSelectedCity(city);
  }, []);

  const selectShowtimeAndGoToSeats = useCallback((slot: ShowtimeSlot, cinema: CinemaItem) => {
    setBooking((prev) => ({
      ...prev,
      cinema,
      time: slot.time,
      format: slot.format,
      room: slot.room,
      showtimeId: slot.id,
      seats: [],
      combos: {},
      promoCode: '',
      discountAmount: 0
    }));
    setCurrentView('seats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const quickBook = useCallback((movieId: number, cinemaId: number, dateStr: string, time: string) => {
    const movie = moviesList.find((m) => m.id === movieId) || defaultMovie;
    const cinema = cinemasList.find((c) => c.id === cinemaId) || defaultCinema;

    setBooking((prev) => ({
      ...prev,
      movie,
      cinema,
      dateStr,
      time,
      format: 'IMAX Laser 3D',
      room: 'Phòng IMAX 01',
      showtimeId: 1,
      seats: [],
      combos: {},
      promoCode: '',
      discountAmount: 0
    }));
    setCurrentView('seats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [moviesList, cinemasList]);

  const toggleSeat = useCallback((seat: SelectedSeatInfo) => {
    setBooking((prev) => {
      const exists = prev.seats.some((s) => s.code === seat.code);
      if (exists) {
        return {
          ...prev,
          seats: prev.seats.filter((s) => s.code !== seat.code)
        };
      }
      if (prev.seats.length >= 8) {
        showToast('Bạn chỉ có thể chọn tối đa 8 ghế cho mỗi giao dịch!', 'error');
        return prev;
      }
      return {
        ...prev,
        seats: [...prev.seats, seat]
      };
    });
  }, [showToast]);

  const updateComboQty = useCallback((comboId: string, delta: number) => {
    setBooking((prev) => {
      const current = prev.combos[comboId] || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        combos: {
          ...prev.combos,
          [comboId]: next
        }
      };
    });
  }, []);

  const calculateTotals = useCallback(() => {
    const ticketTotal = booking.seats.reduce((sum, s) => sum + s.price, 0);
    const comboTotal = Object.entries(booking.combos).reduce((sum, [id, qty]) => {
      const combo = concessions.find((c) => c.id === id);
      return sum + (combo ? combo.price * qty : 0);
    }, 0);
    const discount = booking.discountAmount;
    const finalTotal = Math.max(0, ticketTotal + comboTotal - discount);
    return { ticketTotal, comboTotal, discount, finalTotal };
  }, [booking.seats, booking.combos, booking.discountAmount, concessions]);

  const applyPromo = useCallback(async (code: string) => {
    const { ticketTotal, comboTotal } = calculateTotals();
    const subtotal = ticketTotal + comboTotal;
    try {
      const res = await promotionApi.validatePromotion(code, subtotal, user?.id);
      if (res.valid) {
        setBooking((prev) => ({
          ...prev,
          promoCode: res.code,
          discountAmount: res.discountAmount
        }));
        showToast(res.message, 'success');
        return { success: true, message: res.message };
      } else {
        setBooking((prev) => ({
          ...prev,
          promoCode: '',
          discountAmount: 0
        }));
        showToast(res.message, 'error');
        return { success: false, message: res.message };
      }
    } catch {
      showToast('Không thể kiểm tra mã khuyến mãi lúc này.', 'error');
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  }, [calculateTotals, user?.id, showToast]);

  const setPaymentMethod = useCallback((method: 'momo' | 'vnpay' | 'zalopay' | 'visa') => {
    setBooking((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setCustomerInfo = useCallback((name: string, phone: string) => {
    setBooking((prev) => ({ ...prev, customerName: name, customerPhone: phone }));
  }, []);

  const proceedToCheckout = useCallback(async () => {
    if (booking.seats.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 ghế để tiếp tục!', 'error');
      return;
    }

    // Call backend hold API
    const holdConcessions = Object.entries(booking.combos)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ concessionId: parseInt(id, 10), quantity: qty }));

    const seatIds = booking.seats.map((s) => s.seatId);
    const showtimeId = booking.showtimeId || 1;

    try {
      const holdRes = await bookingApi.holdSeats({
        showtimeId,
        seatIds,
        concessions: holdConcessions,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        paymentMethod: booking.paymentMethod,
        promoCode: booking.promoCode,
        discountAmount: booking.discountAmount
      });

      if (holdRes.success) {
        setBooking((prev) => ({
          ...prev,
          backendBookingId: holdRes.bookingId,
          bookingCode: holdRes.bookingCode
        }));
        setCurrentView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể giữ ghế. Ghế có thể đã có người chọn hoặc đang bảo trì!';
      showToast(msg, 'error');
      return;
    }

    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [booking, showToast]);

  const confirmPayment = useCallback(async (): Promise<TicketRecord | null> => {
    const { finalTotal } = calculateTotals();
    let bookingCode = booking.bookingCode || ('CV-' + Math.floor(100000 + Math.random() * 900000));

    // Confirm booking with backend
    if (booking.backendBookingId) {
      try {
        const confirmRes = await bookingApi.confirmBooking(booking.backendBookingId);
        if (confirmRes.bookingCode) {
          bookingCode = confirmRes.bookingCode;
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Xác nhận đặt vé không thành công.';
        showToast(msg, 'error');
        return null;
      }
    }

    const paymentMethodNames: Record<string, string> = {
      momo: 'Ví MoMo',
      vnpay: 'VNPAY-QR',
      zalopay: 'ZaloPay',
      visa: 'Thẻ Quốc Tế (Visa/Mastercard)'
    };

    const newTicket: TicketRecord = {
      id: 't_' + Date.now(),
      bookingId: booking.backendBookingId,
      bookingCode,
      movie: booking.movie,
      cinema: booking.cinema,
      dateStr: booking.dateStr,
      time: booking.time,
      format: booking.format,
      room: booking.room,
      seats: [...booking.seats],
      combos: { ...booking.combos },
      totalPaid: finalTotal,
      paymentMethod: paymentMethodNames[booking.paymentMethod] || 'Ví Điện Tử',
      status: 'valid',
      createdAt: new Date().toISOString()
    };

    setMyTickets((prev) => [newTicket, ...prev]);
    setLastConfirmedTicket(newTicket);

    // Reward points for member: 1 point per 1000 VND
    const earnedPoints = Math.round(finalTotal / 1000);
    await addPoints(earnedPoints);

    showToast(`Thanh toán thành công! Mã vé: ${bookingCode}`, 'success');
    return newTicket;
  }, [calculateTotals, booking, addPoints, showToast]);

  const cancelTicket = useCallback(async (code: string) => {
    const target = myTickets.find((t) => t.bookingCode === code);
    if (target?.bookingId) {
      try {
        await bookingApi.cancelBooking(target.bookingId);
      } catch {}
    }
    setMyTickets((prev) =>
      prev.map((t) => (t.bookingCode === code ? { ...t, status: 'cancelled' } : t))
    );
    showToast(`Đã hủy vé ${code} thành công.`, 'info');
  }, [myTickets, showToast]);

  const openTrailer = useCallback((movie: MovieItem) => {
    setTrailerModalMovie(movie);
  }, []);

  const closeTrailer = useCallback(() => {
    setTrailerModalMovie(null);
  }, []);

  const openTicketQr = useCallback((ticket: TicketRecord) => {
    setTicketQrModalData(ticket);
  }, []);

  const closeTicketQr = useCallback(() => {
    setTicketQrModalData(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        currentView,
        selectedMovieId,
        selectedDateIndex,
        selectedCity,
        booking,
        concessions,
        myTickets,
        lastConfirmedTicket,
        trailerModalMovie,
        ticketQrModalData,
        seatHoldSeconds,
        navigateTo,
        openMovieDetail,
        selectDate,
        selectCity,
        selectShowtimeAndGoToSeats,
        quickBook,
        toggleSeat,
        updateComboQty,
        applyPromo,
        setPaymentMethod,
        setCustomerInfo,
        proceedToCheckout,
        confirmPayment,
        cancelTicket,
        openTrailer,
        closeTrailer,
        openTicketQr,
        closeTicketQr,
        calculateTotals
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
