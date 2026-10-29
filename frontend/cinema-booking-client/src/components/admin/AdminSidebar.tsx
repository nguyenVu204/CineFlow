import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useBooking } from '../../context/BookingContext';

export const AdminSidebar: React.FC = () => {
  const {
    currentModule,
    switchModule,
    mobileSidebarOpen,
    toggleMobileSidebar,
    users,
    movies,
    showtimes,
    bookings
  } = useAdmin();

  const { navigateTo } = useBooking();

  const activeBookingsCount = bookings.filter((b) => b.status === 'active').length;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm animate-fade-in"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-admin-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-admin-crimson to-amber-500 flex items-center justify-center text-white shadow-lg shadow-admin-crimson/30">
                <i className="fa-solid fa-film text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-lg tracking-tight text-white">
                    CINE<span className="text-admin-crimson">VERSE</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                    CMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Hệ Thống Quản Trị Rạp</p>
              </div>
            </div>
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Navigation Menu List */}
          <div className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-13rem)]">
            <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Menu Quản Lý Chính
            </p>

            {/* 1. Dashboard */}
            <button
              onClick={() => switchModule('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentModule === 'dashboard'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-chart-pie w-5 text-center"></i>
                <span>1. Tổng quan hệ thống</span>
              </span>
            </button>

            {/* 2. Users */}
            <button
              onClick={() => switchModule('users')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentModule === 'users'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-users-gear w-5 text-center text-sky-400"></i>
                <span>2. Quản lý Người dùng</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-200">
                {users.length}
              </span>
            </button>

            {/* 3. Movies */}
            <button
              onClick={() => switchModule('movies')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentModule === 'movies'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-clapperboard w-5 text-center text-amber-400"></i>
                <span>3. Quản lý Phim</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-200">
                {movies.length}
              </span>
            </button>

            {/* 4. Showtimes */}
            <button
              onClick={() => switchModule('showtimes')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentModule === 'showtimes'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-couch w-5 text-center text-purple-400"></i>
                <span>4. Lịch chiếu & Phòng</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-200">
                {showtimes.length}
              </span>
            </button>

            {/* 5. Bookings */}
            <button
              onClick={() => switchModule('bookings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentModule === 'bookings'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-qrcode w-5 text-center text-emerald-400"></i>
                <span>5. Đơn vé & Soát vé</span>
              </span>
              {activeBookingsCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-admin-crimson text-white">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* 6. FnB & Vouchers */}
            <button
              onClick={() => switchModule('fnb')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentModule === 'fnb'
                  ? 'bg-admin-crimson text-white shadow-lg shadow-admin-crimson/25 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-popcorn w-5 text-center text-pink-400"></i>
                <span>6. Bắp nước & Voucher</span>
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-800 bg-admin-950/60 space-y-3">
          <button
            onClick={() => navigateTo('home')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i> Về Trang Xem Phim
          </button>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Máy chủ: Online
            </span>
            <span className="font-mono text-[11px] text-slate-500">v3.5 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};

