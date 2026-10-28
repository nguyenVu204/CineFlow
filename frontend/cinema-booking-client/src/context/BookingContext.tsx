import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MovieItem } from '../types/movie';
import { CinemaItem, ShowtimeSlot } from '../types/cinema';
import { SelectedSeatInfo, TicketRecord } from '../types/booking';
import { MOVIES_DATA } from '../services/mock/moviesData';
import { CINEMAS_DATA, SHOWTIME_SLOTS } from '../services/mock/cinemasData';
import { CONCESSIONS_DATA } from '../services/mock/concessionsData';
import { validatePromoCode } from '../services/mock/promotionsData';
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
  applyPromo: (code: string) => { success: boolean; message: string };
  setPaymentMethod: (method: 'momo' | 'vnpay' | 'zalopay' | 'visa') => void;
  setCustomerInfo: (name: string, phone: string) => void;
  proceedToCheckout: () => void;
  confirmPayment: () => Promise<TicketRecord | null>;
  cancelTicket: (code: string) => void;
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

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addPoints } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<number>(MOVIES_DATA[0].id);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<string>('Hà Nội');

  const [booking, setBooking] = useState<BookingData>({
    movie: MOVIES_DATA[0],
    cinema: CINEMAS_DATA[0],
    dateStr: 'Hôm nay',
    time: '19:30',
    format: 'IMAX Laser 3D',
    room: 'Phòng IMAX 01',
    showtimeId: 104,
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
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 't_init_1',
        bookingCode: 'CV-893412',
        movie: MOVIES_DATA[0],
        cinema: {
          id: 1,
          name: 'CINEVERSE Vincom Royal City',
          address: 'Tầng B2, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
          city: 'Hà Nội',
          screens: []
        },
        dateStr: 'Hôm nay',
        time: '19:30',
        format: 'IMAX Laser 3D',
        room: 'Phòng IMAX 01',
        seats: [
          { seatId: 1, code: 'E7', row: 'E', type: 'vip', price: 115000 },
          { seatId: 2, code: 'E8', row: 'E', type: 'vip', price: 115000 }
        ],
        combos: { cb2: 1 },
        totalPaid: 349000,
        paymentMethod: 'Ví MoMo',
        status: 'valid',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [lastConfirmedTicket, setLastConfirmedTicket] = useState<TicketRecord | null>(null);
  const [trailerModalMovie, setTrailerModalMovie] = useState<MovieItem | null>(null);
  const [ticketQrModalData, setTicketQrModalData] = useState<TicketRecord | null>(null);
  const [seatHoldSeconds, setSeatHoldSeconds] = useState<number>(300);

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
    const found = MOVIES_DATA.find((m) => m.id === id) || MOVIES_DATA[0];
    setBooking((prev) => ({
      ...prev,
      movie: found
    }));
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    const movie = MOVIES_DATA.find((m) => m.id === movieId) || MOVIES_DATA[0];
    const cinema = CINEMAS_DATA.find((c) => c.id === cinemaId) || CINEMAS_DATA[0];
    const slot = SHOWTIME_SLOTS.find((s) => s.time === time) || SHOWTIME_SLOTS[3];

    setBooking((prev) => ({
      ...prev,
      movie,
      cinema,
      dateStr,
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
      const combo = CONCESSIONS_DATA.find((c) => c.id === id);
      return sum + (combo ? combo.price * qty : 0);
    }, 0);
    const discount = booking.discountAmount;
    const finalTotal = Math.max(0, ticketTotal + comboTotal - discount);
    return { ticketTotal, comboTotal, discount, finalTotal };
  }, [booking.seats, booking.combos, booking.discountAmount]);

  const applyPromo = useCallback((code: string) => {
    const { ticketTotal, comboTotal } = calculateTotals();
    const subtotal = ticketTotal + comboTotal;
    const res = validatePromoCode(code, subtotal);
    if (res.valid) {
      setBooking((prev) => ({
        ...prev,
        promoCode: code.toUpperCase().trim(),
        discountAmount: res.discount
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
  }, [calculateTotals, showToast]);

  const setPaymentMethod = useCallback((method: 'momo' | 'vnpay' | 'zalopay' | 'visa') => {
    setBooking((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const setCustomerInfo = useCallback((name: string, phone: string) => {
    setBooking((prev) => ({ ...prev, customerName: name, customerPhone: phone }));
  }, []);

  const proceedToCheckout = useCallback(() => {
    if (booking.seats.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 ghế để tiếp tục!', 'error');
      return;
    }
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [booking.seats.length, showToast]);

  const confirmPayment = useCallback(async (): Promise<TicketRecord | null> => {
    const { finalTotal } = calculateTotals();
    const bookingCode = 'CV-' + Math.floor(100000 + Math.random() * 900000);

    // If backend booking hold exists, try to confirm with backend
    if (booking.backendBookingId) {
      try {
        await bookingApi.confirmBooking(booking.backendBookingId);
      } catch {
        // Backend confirmation mock simulation
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
    addPoints(earnedPoints);

    showToast(`Thanh toán thành công! Mã vé: ${bookingCode}`, 'success');
    return newTicket;
  }, [calculateTotals, booking, addPoints, showToast]);

  const cancelTicket = useCallback((code: string) => {
    setMyTickets((prev) =>
      prev.map((t) => (t.bookingCode === code ? { ...t, status: 'cancelled' } : t))
    );
    showToast(`Đã hủy vé ${code} thành công.`, 'info');
  }, [showToast]);

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

