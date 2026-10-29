import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { AdminProvider } from './context/AdminContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/modals/AuthModal';
import { TrailerModal } from './components/modals/TrailerModal';
import { TicketQrModal } from './components/modals/TicketQrModal';
import { HomeView } from './components/views/HomeView';
import { MovieDetailView } from './components/views/MovieDetailView';
import { SeatSelectionView } from './components/views/SeatSelectionView';
import { CheckoutView } from './components/views/CheckoutView';
import { MyTicketsView } from './components/views/MyTicketsView';
import { AdminLayout } from './components/admin/AdminLayout';

const MainContent: React.FC = () => {
  const { currentView, navigateTo } = useBooking();
  const { isAuthenticated, isAdmin } = useAuth();

  // Protected Admin Route
  if (currentView === 'admin') {
    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cinema-950 text-white p-4">
          <div className="text-center p-8 glass-panel rounded-3xl max-w-md border border-white/10 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cinema-red/20 border border-cinema-red/30 flex items-center justify-center text-cinema-red text-2xl">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-xl font-bold font-display mb-2 text-white">Yêu Cầu Quyền Quản Trị</h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Khu vực này chỉ dành riêng cho tài khoản Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản Admin để truy cập hệ thống CMS.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cinema-red to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-cinema-red/20 transition"
            >
              Về Trang Khách Hàng
            </button>
          </div>
        </div>
      );
    }

    return (
      <AdminProvider>
        <AdminLayout />
        <ToastContainer />
      </AdminProvider>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        {currentView === 'home' && <HomeView />}
        {currentView === 'detail' && <MovieDetailView />}
        {currentView === 'seats' && <SeatSelectionView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'mytickets' && <MyTicketsView />}
      </main>
      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <TrailerModal />
      <TicketQrModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BookingProvider>
          <MainContent />
        </BookingProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
