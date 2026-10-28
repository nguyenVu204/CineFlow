import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminUsersView } from './views/AdminUsersView';
import { AdminMoviesView } from './views/AdminMoviesView';
import { AdminShowtimesView } from './views/AdminShowtimesView';
import { AdminBookingsView } from './views/AdminBookingsView';
import { AdminFnbView } from './views/AdminFnbView';
import { AdminUserModal } from './modals/AdminUserModal';
import { AdminMovieModal } from './modals/AdminMovieModal';
import { AdminTicketModal } from './modals/AdminTicketModal';

export const AdminLayout: React.FC = () => {
  const { currentModule } = useAdmin();

  return (
    <div className="h-screen flex overflow-hidden selection:bg-admin-crimson selection:text-white bg-admin-950 font-sans">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Right Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader />

        {/* Dynamic Module Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {currentModule === 'dashboard' && <AdminDashboardView />}
          {currentModule === 'users' && <AdminUsersView />}
          {currentModule === 'movies' && <AdminMoviesView />}
          {currentModule === 'showtimes' && <AdminShowtimesView />}
          {currentModule === 'bookings' && <AdminBookingsView />}
          {currentModule === 'fnb' && <AdminFnbView />}
        </main>
      </div>

      {/* Admin Modals */}
      <AdminUserModal />
      <AdminMovieModal />
      <AdminTicketModal />
    </div>
  );
};

