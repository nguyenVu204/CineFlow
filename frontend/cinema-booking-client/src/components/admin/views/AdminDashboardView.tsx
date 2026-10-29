import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatVND } from '../../../utils/formatters';

export const AdminDashboardView: React.FC = () => {
  const {
    kpis,
    switchModule,
    movies,
    bookings,
    openTicketModal,
    checkInBooking
  } = useAdmin();

  // 7-day revenue chart data calculated from real bookings
  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const today = new Date();

  const rawChartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 6;
    const label = isToday ? 'Hôm nay' : dayNames[d.getDay()];

    const dayRevenue = bookings
      .filter((b) => b.status !== 'cancelled' && b.datetime && b.datetime.startsWith(dateStr))
      .reduce((sum, b) => sum + b.totalPaid, 0);

    return {
      label,
      val: Math.round(dayRevenue / 1000000), // in millions
      revenue: dayRevenue,
      isToday
    };
  });

  const maxVal = Math.max(...rawChartDays.map((d) => d.val), 1);
  const chartDays = rawChartDays.map((d) => ({
    ...d,
    height: `${Math.max(12, Math.round((d.val / maxVal) * 100))}%`
  }));

  // Top movies calculated from real bookings
  const movieRevenueMap = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((acc, b) => {
      acc[b.movieTitle] = (acc[b.movieTitle] || 0) + b.totalPaid;
      return acc;
    }, {} as Record<string, number>);

  const totalBookingRevenue = Object.values(movieRevenueMap).reduce((sum, v) => sum + v, 0);

  const calculatedTopMovies = Object.entries(movieRevenueMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([title, revenue]) => ({
      title,
      revenue,
      percent: totalBookingRevenue > 0 ? Math.round((revenue / totalBookingRevenue) * 100) : 0
    }));

  const topMoviesData =
    calculatedTopMovies.length > 0
      ? calculatedTopMovies
      : movies.slice(0, 4).map((m) => ({
          title: m.title,
          revenue: 0,
          percent: 0
        }));

  // Latest 5 bookings
  const recentBookings = bookings.slice(0, 5);

  return (
    <section id="mod-dashboard" className="module-view space-y-6 animate-fade-in">
      {/* Top Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg shrink-0">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Bảng Điều Khiển Vận Hành Hệ Thống</h3>
            <p className="text-xs text-slate-400">
              Dữ liệu tổng quan từ các phân hệ Người dùng, Phim, Lịch chiếu và Đơn đặt vé được cập nhật theo thời gian thực.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Hệ thống hoạt động ổn định
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Revenue */}
        <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Doanh Thu Đơn Vé</span>
            <span className="w-10 h-10 rounded-xl bg-admin-crimson/15 text-admin-crimson flex items-center justify-center">
              <i className="fa-solid fa-sack-dollar"></i>
            </span>
          </div>
          <p className="text-2xl font-display font-black text-white mt-3">
            {formatVND(kpis.totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
            <i className="fa-solid fa-circle-check mr-1"></i>Doanh thu thanh toán thành công
          </p>
        </div>

        {/* Card 2: Tickets */}
        <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Đơn Vé Thành Công</span>
            <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <i className="fa-solid fa-ticket"></i>
            </span>
          </div>
          <p className="text-2xl font-display font-black text-white mt-3">
            {kpis.totalTickets} đơn
          </p>
          <p className="text-[11px] text-amber-400 font-semibold mt-1">
            Đã soát vé: {kpis.checkedInCount} đơn
          </p>
        </div>

        {/* Card 3: Users */}
        <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Tài Khoản Người Dùng</span>
            <span className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <i className="fa-solid fa-users"></i>
            </span>
          </div>
          <p className="text-2xl font-display font-black text-white mt-3">{kpis.totalUsers}</p>
          <p className="text-[11px] text-sky-400 font-semibold mt-1">
            Đang hoạt động: {kpis.activeUsersCount}
          </p>
        </div>

        {/* Card 4: Occupancy */}
        <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tỷ Lệ Lấp Đầy Phòng Chiếu</span>
            <span className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <i className="fa-solid fa-couch"></i>
            </span>
          </div>
          <p className="text-2xl font-display font-black text-white mt-3">
            {kpis.occupancyPercent}%
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-admin-crimson to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${kpis.occupancyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chart & Top Movies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-admin-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Biểu Đồ Doanh Thu 7 Ngày Qua</h3>
              <p className="text-xs text-slate-400">Đơn vị: Triệu VNĐ (Bao gồm Vé + Bắp nước)</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold">
              Real-time
            </span>
          </div>
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
            {chartDays.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">{d.val}Tr</span>
                <div
                  className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-admin-crimson to-amber-400 shadow-lg shadow-admin-crimson/30'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  style={{ height: d.height }}
                ></div>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Movies */}
        <div className="lg:col-span-5 bg-admin-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Top Phim Doanh Thu Cao</h3>
              <p className="text-xs text-slate-400">Tỷ trọng doanh thu phòng vé thực tế</p>
            </div>
            <button
              onClick={() => switchModule('movies')}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {topMoviesData.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white line-clamp-1">{m.title}</span>
                  <span className="text-amber-400 font-mono font-bold">{m.percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-admin-crimson rounded-full"
                    style={{ width: `${m.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Bookings Table */}
      <div className="bg-admin-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Giao Dịch Đặt Vé Gần Đây</h3>
            <p className="text-xs text-slate-400">Thao tác duyệt Check-in hoặc xem vé trực tiếp</p>
          </div>
          <button
            onClick={() => switchModule('bookings')}
            className="text-xs font-bold text-admin-crimson hover:underline"
          >
            Mở Quản lý Đơn vé <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-3 px-3">Mã Vé</th>
                <th className="py-3 px-3">Khách Hàng</th>
                <th className="py-3 px-3">Phim & Phòng</th>
                <th className="py-3 px-3">Ghế</th>
                <th className="py-3 px-3">Tổng Tiền</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentBookings.map((b) => {
                const statusBadge =
                  b.status === 'cancelled' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                      Đã hủy vé
                    </span>
                  ) : b.status === 'checked-in' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                      <i className="fa-solid fa-check-double mr-1"></i>Đã vào rạp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Chờ soát vé
                    </span>
                  );

                return (
                  <tr key={b.code} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-black text-amber-400">{b.code}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white line-clamp-1">{b.movieTitle}</p>
                      <p className="text-[11px] text-slate-400">{b.room}</p>
                    </td>
                    <td className="py-3 px-3 font-bold text-admin-crimson">{b.seats.join(', ')}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatVND(b.totalPaid)}</td>
                    <td className="py-3 px-3">{statusBadge}</td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => openTicketModal(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                      >
                        <i className="fa-solid fa-qrcode mr-1 text-amber-400"></i> Xem
                      </button>
                      {b.status === 'active' && (
                        <button
                          onClick={() => checkInBooking(b.code)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                        >
                          Check-in
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
