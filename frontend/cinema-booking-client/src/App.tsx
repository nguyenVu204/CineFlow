import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
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
  const { currentView } = useBooking();

  if (currentView === 'admin') {
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
