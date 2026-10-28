import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useToast } from '../../../context/ToastContext';
import { formatVND } from '../../../utils/formatters';

export const AdminBookingsView: React.FC = () => {
  const {
    bookings,
    bookingFilter,
    setBookingFilter,
    checkInBooking,
    cancelBooking,
    openTicketModal
  } = useAdmin();

  const { showToast } = useToast();
  const [checkinInput, setCheckinInput] = useState('');

  const handleQuickCheckinSubmit = () => {
    const code = checkinInput.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã vé CV-XXXXXX hoặc số điện thoại để soát vé!', 'error');
      return;
    }

    const found = bookings.find(
      (b) => b.code.toUpperCase() === code || b.customerPhone === code
    );

    if (!found) {
      showToast(`Không tìm thấy đơn vé nào khớp với "${code}"!`, 'error');
      return;
    }

    if (found.status === 'checked-in') {
      showToast(`Vé ${found.code} này ĐÃ ĐƯỢC CHECK-IN trước đó rồi!`, 'error');
      return;
    }

    if (found.status === 'cancelled') {
      showToast(`Vé ${found.code} này ĐÃ BỊ HỦY, không thể check-in!`, 'error');
      return;
    }

    checkInBooking(found.code);
    setCheckinInput('');
  };

  const filteredBookings = bookings.filter((b) => {
    const matchFilter = bookingFilter === 'all' || b.status === bookingFilter;
    const q = checkinInput.trim().toUpperCase();
    const matchSearch =
      !q ||
      b.code.toUpperCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerName.toUpperCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <section id="mod-bookings" className="module-view space-y-6 animate-fade-in">
      {/* QR Check-in Scanner Bar */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i className="fa-solid fa-qrcode"></i> Quầy Kiểm Soát Vé Tự Động
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
            Soát Mã Vé Điện Tử (Check-in Vào Rạp)
          </h3>
          <p className="text-xs text-slate-400">
            Nhập mã vé (VD:{' '}
            <code
              className="text-amber-400 font-bold cursor-pointer hover:underline"
              onClick={() => setCheckinInput('CV-893412')}
            >
              CV-893412
            </code>
            ) để xác thực và in thẻ vào phòng chiếu
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={checkinInput}
            onChange={(e) => setCheckinInput(e.target.value)}
            placeholder="Nhập mã CV-XXXXXX hoặc SĐT..."
            className="flex-1 md:w-64 bg-admin-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase outline-none focus:border-emerald-400 transition"
          />
          <button
            onClick={handleQuickCheckinSubmit}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shrink-0 transition flex items-center gap-1"
          >
            <i className="fa-solid fa-check-double mr-1"></i> Duyệt Check-in
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBookingFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              bookingFilter === 'all'
                ? 'bg-admin-crimson text-white shadow-md'
                : 'bg-admin-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            Tất cả đơn vé
          </button>
          <button
            onClick={() => setBookingFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              bookingFilter === 'active'
                ? 'bg-admin-crimson text-white shadow-md font-bold'
                : 'bg-admin-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            Chờ Check-in
          </button>
          <button
            onClick={() => setBookingFilter('checked-in')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              bookingFilter === 'checked-in'
                ? 'bg-admin-crimson text-white shadow-md font-bold'
                : 'bg-admin-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            Đã vào rạp
          </button>
          <button
            onClick={() => setBookingFilter('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              bookingFilter === 'cancelled'
                ? 'bg-admin-crimson text-white shadow-md font-bold'
                : 'bg-admin-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            Đã hủy
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-admin-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-admin-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-3.5 px-4">Mã Đơn / Khách Hàng</th>
                <th className="py-3.5 px-4">Phim & Suất Chiếu</th>
                <th className="py-3.5 px-4">Ghế & Combo Bắp Nước</th>
                <th className="py-3.5 px-4">Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn đặt vé nào khớp điều kiện.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge =
                    b.status === 'cancelled' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400">
                        Đã hủy vé
                      </span>
                    ) : b.status === 'checked-in' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-400">
                        <i className="fa-solid fa-check-double mr-1"></i>Đã vào rạp
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                        Chờ soát vé
                      </span>
                    );

                  return (
                    <tr key={b.code} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {b.code}
                        </span>
                        <p className="font-bold text-white mt-0.5">{b.customerName}</p>
                        <p className="text-xs text-slate-400">{b.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{b.movieTitle}</p>
                        <p className="text-xs text-amber-400">
                          {b.room} • {b.datetime}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-admin-crimson">
                          Ghế: {b.seats.join(', ')}
                        </p>
                        <p className="text-xs text-slate-400">{b.combos}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{formatVND(b.totalPaid)}</p>
                        <p className="text-[11px] text-slate-400">{b.paymentMethod}</p>
                      </td>
                      <td className="py-3.5 px-4">{badge}</td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openTicketModal(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                        >
                          <i className="fa-solid fa-qrcode mr-1 text-amber-400"></i> Vé QR
                        </button>
                        {b.status === 'active' && (
                          <>
                            <button
                              onClick={() => checkInBooking(b.code)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                            >
                              Check-in
                            </button>
                            <button
                              onClick={() => cancelBooking(b.code)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs transition"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

