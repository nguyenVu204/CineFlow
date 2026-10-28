import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useBooking } from '../../context/BookingContext';

export const AdminHeader: React.FC = () => {
  const { currentModule, toggleMobileSidebar, openUserModal, openMovieModal } = useAdmin();
  const { navigateTo } = useBooking();

  const moduleTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tổng Quan Hệ Thống',
      subtitle: 'Thống kê doanh thu, vé bán và hiệu suất rạp theo thời gian thực'
    },
    users: {
      title: 'Quản Lý Người Dùng & Phân Quyền',
      subtitle: 'Danh sách tài khoản thành viên, nhân viên và quản trị viên'
    },
    movies: {
      title: 'Danh Mục Phim Điện Ảnh',
      subtitle: 'Quản lý thông tin phim, trạng thái công chiếu và giá vé cơ bản'
    },
    showtimes: {
      title: 'Lịch Chiếu & Quản Lý Phòng',
      subtitle: 'Tạo suất chiếu, điều phối phòng chiếu và cấu hình khóa ghế bảo trì'
    },
    bookings: {
      title: 'Quản Lý Đơn Vé & Soát Vé QR',
      subtitle: 'Quầy soát vé tự động, duyệt check-in vào rạp và xử lý hoàn/hủy vé'
    },
    fnb: {
      title: 'Bắp Nước & Mã Giảm Giá',
      subtitle: 'Quản lý thực đơn combo bắp nước và các chiến dịch voucher khuyến mãi'
    }
  };

  const currentInfo = moduleTitles[currentModule] || moduleTitles.dashboard;

  return (
    <header className="h-20 bg-admin-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 transition"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-display font-black text-white">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Header Tools */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('home')}
          className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
        >
          <i className="fa-solid fa-globe text-emerald-400"></i> Xem Trang Khách
        </button>
        <button
          onClick={() => openUserModal()}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
        >
          <i className="fa-solid fa-user-plus text-sky-400"></i> + Người dùng
        </button>
        <button
          onClick={() => openMovieModal()}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-admin-crimson hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-admin-crimson/20 transition"
        >
          <i className="fa-solid fa-plus"></i> + Thêm Phim Mới
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-admin-crimson flex items-center justify-center text-white font-black text-xs shadow">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-none">Lê Quản Trị</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

