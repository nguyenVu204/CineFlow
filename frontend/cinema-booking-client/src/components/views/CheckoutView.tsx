import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CONCESSIONS_DATA } from '../../services/mock/concessionsData';
import { formatVND, getAgeBadgeColor } from '../../utils/formatters';

export const CheckoutView: React.FC = () => {
  const {
    booking,
    seatHoldSeconds,
    calculateTotals,
    applyPromo,
    setPaymentMethod,
    setCustomerInfo,
    confirmPayment,
    navigateTo,
    lastConfirmedTicket
  } = useBooking();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [isSuccessStage, setIsSuccessStage] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const [name, setName] = useState(booking.customerName || (user ? user.name : 'Nguyễn Văn A'));
  const [phone, setPhone] = useState(
    booking.customerPhone || (user ? user.phone || '0987654321' : '0987654321')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ticketTotal, comboTotal, discount, finalTotal } = calculateTotals();
  const subtotal = ticketTotal + comboTotal;

  // Format countdown timer 05:00
  const minutes = Math.floor(seatHoldSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (seatHoldSeconds % 60).toString().padStart(2, '0');

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      setPromoFeedback({ text: 'Vui lòng nhập mã giảm giá.', isError: true });
      return;
    }
    const res = applyPromo(promoInput);
    setPromoFeedback({ text: res.message, isError: !res.success });
  };

  const handleConfirmOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      showToast('Vui lòng điền họ tên và số điện thoại nhận vé!', 'error');
      return;
    }

    setCustomerInfo(name, phone);
    setIsSubmitting(true);
    const ticket = await confirmPayment();
    setIsSubmitting(false);

    if (ticket) {
      setIsSuccessStage(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const qrMap: Record<string, { url: string; badge: string; color: string }> = {
    momo: {
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEVERSE-PAY-MOMO',
      badge: 'Thanh toán qua Ví MoMo',
      color: 'bg-pink-500/20 text-pink-400'
    },
    vnpay: {
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEVERSE-PAY-VNPAY',
      badge: 'Thanh toán qua VNPAY-QR',
      color: 'bg-blue-500/20 text-blue-400'
    },
    zalopay: {
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEVERSE-PAY-ZALOPAY',
      badge: 'Thanh toán qua Ví ZaloPay',
      color: 'bg-sky-500/20 text-sky-400'
    },
    visa: {
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEVERSE-PAY-VISA',
      badge: 'Thanh toán qua Thẻ Quốc Tế Visa/Master',
      color: 'bg-amber-500/20 text-amber-400'
    }
  };

  const activeQr = qrMap[booking.paymentMethod] || qrMap.momo;

  const seatsList = booking.seats.map((s) => s.code).join(', ');

  const combosSummaryList = Object.entries(booking.combos)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const c = CONCESSIONS_DATA.find((item) => item.id === id);
      return `${qty}x ${c?.name.split('(')[0].trim()}`;
    });
  const combosText = combosSummaryList.length > 0 ? combosSummaryList.join(', ') : 'Không có';

  return (
    <section id="view-checkout" className="page-view animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isSuccessStage ? (
          /* Checkout Form Stage */
          <div id="checkout-stage-form">
            {/* Top Bar with Countdown Timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
              <button
                onClick={() => navigateTo('seats')}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-xl transition"
              >
                <i className="fa-solid fa-arrow-left"></i> Quay lại chọn ghế
              </button>

              <div className="flex items-center gap-3 bg-red-500/15 border border-cinema-red/40 px-4 py-2 rounded-2xl">
                <i className="fa-regular fa-clock text-cinema-red animate-pulse"></i>
                <span className="text-xs text-gray-300">Thời gian giữ ghế:</span>
                <span id="checkout-timer" className="font-mono font-black text-base text-cinema-red">
                  {minutes}:{seconds}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Promo & Payment Method (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Customer Info */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <i className="fa-regular fa-user text-amber-400"></i> Thông Tin Nhận Vé Điện Tử
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-cinema-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cinema-red transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-cinema-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cinema-red transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-tag text-cinema-red"></i> Mã Giảm Giá / Voucher
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Nhập mã (VD: CINEMA50, HAPPY20, WELCOME30)"
                      className="flex-grow bg-cinema-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white uppercase placeholder-gray-500 outline-none focus:border-amber-400 transition"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold text-sm transition"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {promoFeedback && (
                    <p
                      className={`text-xs mt-2 ${
                        promoFeedback.isError ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {promoFeedback.text}
                    </p>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-wallet text-emerald-400"></i> Phương Thức Thanh Toán
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {/* MoMo */}
                    <div
                      onClick={() => setPaymentMethod('momo')}
                      className={`payment-option flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition ${
                        booking.paymentMethod === 'momo'
                          ? 'border border-cinema-red bg-cinema-red/10'
                          : 'border border-white/10 bg-cinema-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        MoMo
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Ví Điện Tử MoMo</p>
                        <p className="text-[11px] text-gray-400">Quét mã QR siêu tốc</p>
                      </div>
                    </div>

                    {/* VNPAY */}
                    <div
                      onClick={() => setPaymentMethod('vnpay')}
                      className={`payment-option flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition ${
                        booking.paymentMethod === 'vnpay'
                          ? 'border border-cinema-red bg-cinema-red/10'
                          : 'border border-white/10 bg-cinema-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        VNPAY
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">VNPAY-QR</p>
                        <p className="text-[11px] text-gray-400">Hỗ trợ hơn 40 ngân hàng</p>
                      </div>
                    </div>

                    {/* ZaloPay */}
                    <div
                      onClick={() => setPaymentMethod('zalopay')}
                      className={`payment-option flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition ${
                        booking.paymentMethod === 'zalopay'
                          ? 'border border-cinema-red bg-cinema-red/10'
                          : 'border border-white/10 bg-cinema-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                        Zalo
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Ví ZaloPay</p>
                        <p className="text-[11px] text-gray-400">Tích điểm đổi quà</p>
                      </div>
                    </div>

                    {/* Visa / Master */}
                    <div
                      onClick={() => setPaymentMethod('visa')}
                      className={`payment-option flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition ${
                        booking.paymentMethod === 'visa'
                          ? 'border border-cinema-red bg-cinema-red/10'
                          : 'border border-white/10 bg-cinema-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-cinema-950 font-bold text-base">
                        <i className="fa-brands fa-cc-visa"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Thẻ ATM / Visa / Master</p>
                        <p className="text-[11px] text-gray-400">Bảo mật chuẩn PCI-DSS</p>
                      </div>
                    </div>
                  </div>

                  {/* Simulated QR Scan Area */}
                  <div className="bg-cinema-950/90 rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center">
                      <img
                        src={activeQr.url}
                        alt="QR Payment"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mb-1 ${activeQr.color}`}
                      >
                        {activeQr.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white mb-1">
                        Quét mã QR hoặc nhấn Xác Nhận Thanh Toán
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Hệ thống mô phỏng cổng thanh toán tự động. Nhấn nút{' '}
                        <strong className="text-white">"Xác Nhận Thanh Toán"</strong> bên phải để
                        hoàn tất xuất vé điện tử ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Final Order Summary (5 cols) */}
              <div className="lg:col-span-5">
                <div className="glass-panel rounded-3xl p-6 border border-white/15 sticky top-28">
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-400 pb-4 border-b border-white/10">
                    Chi Tiết Hóa Đơn
                  </h3>

                  <div className="py-4 space-y-3 border-b border-white/10 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phim:</span>
                      <span className="font-bold text-white text-right">{booking.movie.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rạp chiếu:</span>
                      <span className="font-semibold text-gray-200 text-right">
                        {booking.cinema.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Suất chiếu:</span>
                      <span className="font-semibold text-amber-400 text-right">
                        {booking.time} ({booking.dateStr})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ghế ngồi:</span>
                      <span className="font-bold text-white text-right">{seatsList}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Combo Bắp Nước:</span>
                      <span className="text-gray-200 text-right">{combosText}</span>
                    </div>
                  </div>

                  <div className="py-4 space-y-2 border-b border-white/10 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Tạm tính:</span>
                      <span>{formatVND(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Giảm giá (Voucher):</span>
                        <span>-{formatVND(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="py-5 flex items-center justify-between">
                    <span className="text-base font-bold text-white">Tổng Thanh Toán:</span>
                    <span className="text-2xl font-display font-black text-cinema-red">
                      {formatVND(finalTotal)}
                    </span>
                  </div>

                  <button
                    disabled={isSubmitting}
                    onClick={handleConfirmOrder}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
                  >
                    {isSubmitting ? (
                      <span>Đang xử lý xuất vé...</span>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-check"></i> Xác Nhận Thanh Toán
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* E-Ticket Confirmation Stage */
          <div id="checkout-stage-success" className="max-w-2xl mx-auto py-4 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Đặt Vé Thành Công!
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Đưa mã QR dưới đây cho nhân viên soát vé tại quầy CINEVERSE
              </p>
            </div>

            {/* Realistic Perforated E-Ticket Card */}
            {lastConfirmedTicket && (
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-cinema-800 to-cinema-900 relative">
                  <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    <img
                      src={lastConfirmedTicket.movie.poster}
                      alt={lastConfirmedTicket.movie.title}
                      className="w-24 h-36 object-cover rounded-2xl shadow-lg border border-white/10 shrink-0"
                    />
                    <div className="text-center sm:text-left flex-grow">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-black ${getAgeBadgeColor(
                            lastConfirmedTicket.movie.ageRating
                          )}`}
                        >
                          {lastConfirmedTicket.movie.ageRating}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">
                          {lastConfirmedTicket.format}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-black text-white">
                        {lastConfirmedTicket.movie.title}
                      </h3>
                      <p className="text-sm text-gray-300 font-medium mt-1">
                        <i className="fa-solid fa-location-dot text-cinema-red mr-1.5"></i>
                        {lastConfirmedTicket.cinema.name}
                      </p>
                      <p className="text-xs text-amber-400 font-bold mt-1">
                        <i className="fa-regular fa-clock mr-1.5"></i>
                        {lastConfirmedTicket.time} - {lastConfirmedTicket.dateStr}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10 text-sm">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">Phòng Chiếu</p>
                      <p className="font-bold text-white mt-0.5">{lastConfirmedTicket.room}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase">Ghế Ngồi</p>
                      <p className="font-extrabold text-cinema-red text-base mt-0.5">
                        {lastConfirmedTicket.seats.map((s) => s.code).join(', ')}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[11px] text-gray-400 uppercase">Bắp & Nước</p>
                      <p className="font-semibold text-gray-200 mt-0.5">
                        {Object.entries(lastConfirmedTicket.combos)
                          .filter(([_, qty]) => qty > 0)
                          .map(([id, qty]) => {
                            const c = CONCESSIONS_DATA.find((item) => item.id === id);
                            return `${qty}x ${c?.name.split('(')[0].trim()}`;
                          })
                          .join(', ') || 'Không có'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="relative bg-cinema-900 py-3 px-6 border-y border-dashed border-white/20">
                  <div className="ticket-cutout-left"></div>
                  <div className="ticket-cutout-right"></div>
                </div>

                {/* Bottom QR & Booking Code */}
                <div className="p-6 bg-cinema-950 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${lastConfirmedTicket.bookingCode}`}
                        alt="QR Ticket"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Mã Đặt Vé (Booking ID)</p>
                      <p className="text-2xl font-mono font-black text-amber-400 tracking-wider">
                        {lastConfirmedTicket.bookingCode}
                      </p>
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        <i className="fa-solid fa-circle-check mr-1"></i>Đã thanh toán:{' '}
                        {formatVND(lastConfirmedTicket.totalPaid)} (
                        {lastConfirmedTicket.paymentMethod})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <button
                onClick={() => navigateTo('mytickets')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center gap-2 transition"
              >
                <i className="fa-solid fa-ticket text-amber-400"></i> Quản lý Vé của tôi
              </button>
              <button
                onClick={() => navigateTo('home')}
                className="px-6 py-3 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cinema-red/30 transition"
              >
                <i className="fa-solid fa-house"></i> Về Trang Chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

