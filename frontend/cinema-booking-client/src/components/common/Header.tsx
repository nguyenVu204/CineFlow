import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { currentView, navigateTo, myTickets } = useBooking();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTicketsCount = myTickets.filter((t) => t.status === 'valid').length;

  const handleNavClick = (view: 'home' | 'mytickets', sectionId?: string) => {
    navigateTo(view);
    setMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cinema-red to-amber-500 flex items-center justify-center shadow-lg shadow-cinema-red/30 group-hover:scale-105 transition-transform duration-300">
            <i className="fa-solid fa-film text-white text-xl"></i>
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-wider bg-gradient-to-r from-white via-gray-100 to-amber-400 bg-clip-text text-transparent">
              CINE
            </span>
            <span className="font-display font-black text-2xl tracking-wider text-cinema-red">
              VERSE
            </span>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase -mt-1 font-semibold">
              IMAX & Dolby Atmos
            </p>
          </div>
        </div>

        {/* Navigation Buttons Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-cinema-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              currentView === 'home'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-house text-cinema-red"></i> Trang Chủ
          </button>
          <button
            onClick={() => handleNavClick('home', 'movies-section')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5"
          >
            <i className="fa-solid fa-clapperboard text-amber-400"></i> Lịch Chiếu
          </button>
          <button
            onClick={() => handleNavClick('home', 'promotions-section')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/5"
          >
            <i className="fa-solid fa-gift text-pink-500"></i> Ưu Đãi
          </button>
          <button
            onClick={() => handleNavClick('mytickets')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative ${
              currentView === 'mytickets'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-ticket text-emerald-400"></i> Vé Của Tôi
            {activeTicketsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-cinema-red text-white rounded-full">
                {activeTicketsCount}
              </span>
            )}
          </button>

          {/* Admin Button - ONLY displayed when logged in as Admin */}
          {isAuthenticated && isAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 shadow-lg shadow-amber-500/10 animate-fade-in"
              title="Truy cập Bảng Quản Trị CMS"
            >
              <i className="fa-solid fa-gauge-high text-xs"></i> Quản Trị
            </button>
          )}
        </nav>

        {/* Right Side: Auth / User Profile */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-cinema-red to-amber-600 hover:from-cinema-redGlow hover:to-amber-500 text-white rounded-xl shadow-lg shadow-cinema-red/25 transition-all duration-300 hover:scale-105"
              >
                Đăng Ký
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-cinema-900/90 border border-white/10 px-3 py-1.5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-cinema-red flex items-center justify-center font-bold text-white text-sm shadow-md">
                  <span>{user?.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-extrabold uppercase border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-crown text-[10px]"></i>{' '}
                    <span>{user?.points.toLocaleString('vi-VN')}</span> điểm
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Đăng Xuất"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-cinema-red border border-white/10 flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cinema-900 border-b border-white/10 px-4 py-3 flex flex-col gap-2 animate-fade-in">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 flex items-center gap-3"
          >
            <i className="fa-solid fa-house text-cinema-red"></i> Trang Chủ
          </button>
          <button
            onClick={() => handleNavClick('home', 'movies-section')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 flex items-center gap-3"
          >
            <i className="fa-solid fa-clapperboard text-amber-400"></i> Lịch Chiếu Phim
          </button>
          <button
            onClick={() => handleNavClick('mytickets')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <i className="fa-solid fa-ticket text-emerald-400"></i> Vé Của Tôi
            </span>
            {activeTicketsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-cinema-red text-white rounded-full">
                {activeTicketsCount}
              </span>
            )}
          </button>

          {/* Admin Button Mobile - ONLY displayed when logged in as Admin */}
          {isAuthenticated && isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('admin');
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 animate-fade-in"
            >
              <i className="fa-solid fa-gauge-high"></i> CMS Quản Trị Hệ Thống
            </button>
          )}
        </div>
      )}
    </header>
  );
};
