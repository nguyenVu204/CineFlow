import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { SelectedSeatInfo, SeatAvailabilityResponse } from '../../types/booking';
import { bookingApi } from '../../services/api/bookingApi';
import { formatVND, getAgeBadgeColor } from '../../utils/formatters';

export const SeatSelectionView: React.FC = () => {
  const {
    booking,
    concessions,
    toggleSeat,
    updateComboQty,
    calculateTotals,
    proceedToCheckout,
    navigateTo
  } = useBooking();

  const { ticketTotal, comboTotal, finalTotal } = calculateTotals();
  const [seatAvailability, setSeatAvailability] = useState<SeatAvailabilityResponse[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Fetch real seat availability from backend for the selected showtime
  useEffect(() => {
    let active = true;
    const showtimeId = booking.showtimeId || 1;
    setLoadingSeats(true);
    bookingApi.getSeatAvailability(showtimeId).then((data) => {
      if (active) {
        setSeatAvailability(data);
        setLoadingSeats(false);
      }
    }).catch(() => {
      if (active) setLoadingSeats(false);
    });

    return () => {
      active = false;
    };
  }, [booking.showtimeId]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Summary labels
  const selectedSeatsText =
    booking.seats.length > 0
      ? booking.seats.map((s) => s.code).join(', ')
      : 'Chưa chọn';

  const combosSummaryList = Object.entries(booking.combos)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const c = concessions.find((item) => item.id === id);
      return `${qty}x ${c?.name.split('(')[0].trim() || 'Combo'}`;
    });

  const combosSummaryText =
    combosSummaryList.length > 0 ? combosSummaryList.join(', ') : 'Không có';

  // Helper to determine seat status from backend
  const getSeatStatus = (seatId: number) => {
    const item = seatAvailability.find((s) => s.seatId === seatId);
    if (!item) return 'Available';
    return item.status;
  };

  return (
    <section id="view-seats" className="page-view animate-fade-in py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb / Stepper */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <button
            onClick={() => navigateTo('detail')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-xl transition"
          >
            <i className="fa-solid fa-arrow-left"></i> Đổi suất chiếu
          </button>

          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-2 text-cinema-red">
              <span className="w-6 h-6 rounded-full bg-cinema-red text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              Chọn Ghế & Bắp Nước
            </span>
            <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
            <span className="flex items-center gap-2 text-gray-500">
              <span className="w-6 h-6 rounded-full bg-cinema-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Thanh Toán
            </span>
            <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
            <span className="flex items-center gap-2 text-gray-500">
              <span className="w-6 h-6 rounded-full bg-cinema-800 text-gray-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              Vé Điện Tử
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Seat Map + Concessions (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* SEAT MAP BOX */}
            <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-white/10">
              {/* Screen Visual */}
              <div className="text-center mb-2">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                  Màn Hình Chiếu
                </span>
              </div>
              <div className="cinema-screen flex items-center justify-center">
                <span
                  id="seat-room-format"
                  className="text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mt-2"
                >
                  {booking.format}
                </span>
              </div>

              {/* Seat Grid Container */}
              <div className="overflow-x-auto pb-4">
                <div
                  id="seat-map-grid"
                  className="min-w-[540px] flex flex-col items-center gap-2.5 mx-auto"
                >
                  {rows.map((row, rIdx) => {
                    const isSweetbox = row === 'H';
                    const isVip = ['D', 'E', 'F', 'G'].includes(row);

                    return (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-xs font-bold text-gray-500 text-center">
                          {row}
                        </span>

                        {isSweetbox ? (
                          Array.from({ length: 5 }, (_, idx) => {
                            const num = idx + 1;
                            const code = `H${num}`;
                            const seatId = 70 + num; // seat id 71-75
                            const status = getSeatStatus(seatId);
                            const isSold = status === 'Booked' || status === 'Held';
                            const isMaintenance = status === 'Maintenance';
                            const isSelected = booking.seats.some((s) => s.code === code);
                            const seatData: SelectedSeatInfo = {
                              seatId,
                              code,
                              row: 'H',
                              type: 'sweetbox',
                              price: 240000
                            };

                            return (
                              <button
                                key={code}
                                disabled={isSold || isMaintenance}
                                onClick={() => toggleSeat(seatData)}
                                title={isMaintenance ? 'Ghế đang bảo trì' : isSold ? 'Ghế đã bán' : `Ghế đôi ${code}`}
                                className={`seat w-[76px] h-9 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 transition ${
                                  isMaintenance
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 cursor-not-allowed'
                                    : isSold
                                    ? 'sold bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                                    : isSelected
                                    ? 'selected ring-2 ring-cinema-red'
                                    : 'bg-pink-500/20 border-pink-400/60 text-pink-300 hover:bg-pink-500/30'
                                }`}
                              >
                                {isMaintenance ? (
                                  <><i className="fa-solid fa-screwdriver-wrench text-[10px]"></i> {code}</>
                                ) : (
                                  <><i className="fa-solid fa-couch text-[10px]"></i> {code}</>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          Array.from({ length: 10 }, (_, idx) => {
                            const col = idx + 1;
                            const code = `${row}${col}`;
                            const seatId = rIdx * 10 + col; // 1 to 70
                            const status = getSeatStatus(seatId);
                            const isSold = status === 'Booked' || status === 'Held';
                            const isMaintenance = status === 'Maintenance';
                            const isSelected = booking.seats.some((s) => s.code === code);
                            const type = isVip ? 'vip' : 'standard';
                            const price = isVip ? 115000 : 85000;
                            const seatData: SelectedSeatInfo = {
                              seatId,
                              code,
                              row,
                              type,
                              price
                            };

                            const baseClass = isVip
                              ? 'bg-amber-500/20 border-amber-400/70 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-cinema-700 border-gray-500/70 text-gray-200 hover:bg-cinema-600';

                            return (
                              <React.Fragment key={code}>
                                {(col === 3 || col === 9) && <div className="w-3"></div>}
                                <button
                                  disabled={isSold || isMaintenance}
                                  onClick={() => toggleSeat(seatData)}
                                  title={isMaintenance ? 'Ghế đang bảo trì' : isSold ? 'Ghế đã bán' : code}
                                  className={`seat w-9 h-9 rounded-lg text-xs font-bold border flex items-center justify-center transition ${
                                    isMaintenance
                                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 cursor-not-allowed'
                                      : isSold
                                      ? 'sold bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
                                      : isSelected
                                      ? 'selected ring-2 ring-cinema-red'
                                      : baseClass
                                  }`}
                                >
                                  {isMaintenance ? (
                                    <i className="fa-solid fa-screwdriver-wrench text-[10px]"></i>
                                  ) : isSold ? (
                                    <i className="fa-solid fa-xmark"></i>
                                  ) : (
                                    code
                                  )}
                                </button>
                              </React.Fragment>
                            );
                          })
                        )}

                        <span className="w-6 text-xs font-bold text-gray-500 text-center">
                          {row}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seat Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-6 mt-6 border-t border-white/10 text-xs text-gray-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-cinema-700 border border-gray-500 inline-block"></span>
                  <div>
                    <p className="font-semibold text-white">Ghế Thường</p>
                    <p className="text-[11px] text-gray-400">85.000đ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-400 inline-block"></span>
                  <div>
                    <p className="font-semibold text-amber-400">Ghế VIP</p>
                    <p className="text-[11px] text-gray-400">115.000đ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-5 rounded-md bg-pink-500/20 border border-pink-400 inline-block"></span>
                  <div>
                    <p className="font-semibold text-pink-400">Sweetbox Đôi</p>
                    <p className="text-[11px] text-gray-400">240.000đ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-cinema-red to-orange-500 inline-block shadow shadow-cinema-red/50"></span>
                  <div>
                    <p className="font-semibold text-white">Đang Chọn</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-gray-800 border border-gray-700 text-gray-600 flex items-center justify-center text-[10px]">
                    <i className="fa-solid fa-xmark"></i>
                  </span>
                  <div>
                    <p className="font-semibold text-gray-500">Đã Đặt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center text-[10px]">
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                  </span>
                  <div>
                    <p className="font-semibold text-amber-400">Bảo Trì</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONCESSIONS (BẮP NƯỚC) BOX */}
            <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <i className="fa-solid fa-popcorn text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Chọn Combo Bắp & Nước</h3>
                    <p className="text-xs text-gray-400">
                      Thưởng thức trọn vẹn bộ phim với thực đơn bắp nước CINEVERSE
                    </p>
                  </div>
                </div>
              </div>

              <div id="concessions-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concessions.map((item) => {
                  const qty = booking.combos[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-cinema-900/90 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <i className={`fa-solid ${item.icon || 'fa-popcorn'} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{item.name}</h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                          <p className="text-xs font-extrabold text-amber-400 mt-1.5">
                            {formatVND(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-cinema-950 px-2 py-1.5 rounded-xl border border-white/10 shrink-0">
                        <button
                          onClick={() => updateComboQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                        <button
                          onClick={() => updateComboQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-cinema-red hover:bg-red-600 text-white flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-400 pb-4 border-b border-white/10">
                Thông Tin Đặt Vé
              </h3>

              {/* Movie Mini Card */}
              <div className="flex gap-4 py-4 border-b border-white/10">
                <img
                  src={booking.movie.poster}
                  alt={booking.movie.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-md"
                />
                <div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${getAgeBadgeColor(
                      booking.movie.ageRating
                    )}`}
                  >
                    {booking.movie.ageRating}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5 leading-snug line-clamp-2">
                    {booking.movie.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{booking.movie.genre}</p>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    <i className="fa-solid fa-star text-[10px] mr-1"></i>
                    {booking.movie.rating} / 10
                  </p>
                </div>
              </div>

              {/* Cinema & Session Details */}
              <div className="py-4 space-y-2.5 text-xs border-b border-white/10 text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rạp:</span>
                  <span className="font-bold text-white text-right">{booking.cinema.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suất chiếu:</span>
                  <span className="font-bold text-white">
                    {booking.time} • {booking.dateStr}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phòng chiếu:</span>
                  <span className="font-semibold text-white">{booking.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Định dạng:</span>
                  <span className="font-semibold text-amber-400">{booking.format}</span>
                </div>
              </div>

              {/* Seats Selection Detail */}
              <div className="py-4 space-y-2 text-xs border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ghế đã chọn:</span>
                  <span className="font-extrabold text-cinema-red text-sm">{selectedSeatsText}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Tiền vé ({booking.seats.length} ghế):</span>
                  <span className="font-semibold text-white">{formatVND(ticketTotal)}</span>
                </div>
              </div>

              {/* Concessions Detail */}
              <div className="py-4 space-y-2 text-xs border-b border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bắp & nước:</span>
                  <span className="font-semibold text-white text-right max-w-[200px] truncate">
                    {combosSummaryText}
                  </span>
                </div>
                {comboTotal > 0 && (
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Tiền bắp nước:</span>
                    <span className="font-semibold text-amber-400">{formatVND(comboTotal)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-4 pb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-gray-400">Tổng cộng tạm tính:</span>
                  <span className="text-2xl font-black text-amber-400">{formatVND(finalTotal)}</span>
                </div>
                <p className="text-[11px] text-gray-500 text-right">
                  (Đã bao gồm thuế GTGT và phí dịch vụ)
                </p>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-proceed-checkout"
                onClick={proceedToCheckout}
                disabled={booking.seats.length === 0}
                className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2 transition ${
                  booking.seats.length > 0
                    ? 'bg-gradient-to-r from-cinema-red to-orange-600 hover:from-rose-600 hover:to-orange-500 text-white shadow-cinema-red/30 cursor-pointer'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Tiếp tục thanh toán</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
