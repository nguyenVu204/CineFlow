import { apiClient } from './client';
import { BackendCinema, BackendShowtime, CinemaItem, ShowtimeSlot } from '../../types/cinema';
import { CINEMAS_DATA, SHOWTIME_SLOTS } from '../mock/cinemasData';

export const cinemaApi = {
  async getCinemas(): Promise<CinemaItem[]> {
    try {
      const response = await apiClient.get<BackendCinema[]>('/api/cinemas');
      if (response.data && response.data.length > 0) {
        return response.data.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          city: c.address.includes('Hà Nội')
            ? 'Hà Nội'
            : c.address.includes('Đà Nẵng')
            ? 'Đà Nẵng'
            : 'TP. Hồ Chí Minh',
          screens: (c.screens || []).map((s) => ({
            id: s.id,
            name: s.name,
            format: s.name.includes('IMAX') ? 'IMAX Laser 3D' : '2D Phụ Đề'
          }))
        }));
      }
      return CINEMAS_DATA;
    } catch {
      return CINEMAS_DATA;
    }
  },

  async getShowtimes(movieId?: number, screenId?: number): Promise<ShowtimeSlot[]> {
    try {
      const params: Record<string, any> = {};
      if (movieId) params.movieId = movieId;
      if (screenId) params.screenId = screenId;
      const response = await apiClient.get<BackendShowtime[]>('/api/showtimes', { params });
      if (response.data && response.data.length > 0) {
        return response.data.map((st) => {
          const startTime = new Date(st.startTime);
          const time = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
          return {
            id: st.id,
            time,
            format: st.screen?.name?.includes('IMAX') ? 'IMAX Laser 3D' : '2D Phụ Đề',
            room: st.screen?.name || 'Phòng chiếu',
            price: Number(st.basePrice) || 85000,
            screenId: st.screenId
          };
        });
      }
      return SHOWTIME_SLOTS;
    } catch {
      return SHOWTIME_SLOTS;
    }
  }
};

