import { apiClient } from './client';
import { BackendCinema, BackendShowtime, CinemaItem, ShowtimeSlot } from '../../types/cinema';
import { AdminShowtime } from '../../types/admin';

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
            format: s.name.includes('IMAX')
              ? 'IMAX Laser 3D'
              : s.name.includes('4DX')
              ? '4DX Tuyệt Đỉnh'
              : s.name.includes('Gold')
              ? 'Dolby Atmos 2D'
              : '2D Phụ Đề'
          }))
        }));
      }
      return [];
    } catch {
      return [];
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
          const screenName = st.screen?.name || 'Phòng chiếu';
          const format = screenName.includes('IMAX')
            ? 'IMAX Laser 3D'
            : screenName.includes('4DX')
            ? '4DX Tuyệt Đỉnh'
            : screenName.includes('Gold')
            ? 'Dolby Atmos 2D'
            : '2D Phụ Đề';

          return {
            id: st.id,
            time,
            format,
            room: screenName,
            price: Number(st.basePrice) || 85000,
            screenId: st.screenId
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAdminShowtimes(): Promise<AdminShowtime[]> {
    try {
      const response = await apiClient.get<BackendShowtime[]>('/api/showtimes');
      if (response.data && response.data.length > 0) {
        return response.data.map((st) => {
          const d = new Date(st.startTime);
          const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          const date = d.toISOString().split('T')[0];
          const room = st.screen?.name || 'Phòng IMAX 01';
          const format = room.includes('IMAX')
            ? 'IMAX Laser 3D'
            : room.includes('4DX')
            ? '4DX Tuyệt Đỉnh'
            : room.includes('Gold')
            ? 'Dolby Atmos 2D'
            : '2D Phụ Đề';

          return {
            id: st.id.toString(),
            movieTitle: `Phim #${st.movieId}`,
            room,
            format,
            time,
            date
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  async createShowtime(data: {
    movieId: number;
    screenId: number;
    startTime: string;
    endTime: string;
    basePrice: number;
    status?: number;
  }): Promise<BackendShowtime> {
    const response = await apiClient.post<BackendShowtime>('/api/showtimes', {
      movieId: data.movieId,
      screenId: data.screenId,
      startTime: data.startTime,
      endTime: data.endTime,
      basePrice: data.basePrice,
      status: data.status ?? 0 // Scheduled
    });
    return response.data;
  },

  async deleteShowtime(id: string | number): Promise<void> {
    await apiClient.delete(`/api/showtimes/${id}`);
  }
};
