import { apiClient } from './client';
import { BackendMovie, MovieItem, PagedMoviesResponse } from '../../types/movie';
import { AdminMovie } from '../../types/admin';

export const movieApi = {
  async getMovies(params?: {
    search?: string;
    genre?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<MovieItem[]> {
    try {
      const response = await apiClient.get<PagedMoviesResponse>('/api/movies', { params: { pageSize: 50, ...params } });
      if (response.data && response.data.items) {
        return response.data.items.map((m) => movieApi.adaptBackendMovie(m));
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAdminMovies(): Promise<AdminMovie[]> {
    try {
      const movies = await movieApi.getMovies();
      return movies.map((m) => ({
        id: m.id.toString(),
        title: m.title,
        director: m.director,
        genre: m.genre,
        duration: `${m.duration} phút`,
        age: m.ageRating,
        rating: m.rating,
        basePrice: 120000,
        status: m.status === 'showing' ? 'showing' : 'upcoming',
        poster: m.poster
      }));
    } catch {
      return [];
    }
  },

  async getMovieById(id: number): Promise<MovieItem | null> {
    try {
      const response = await apiClient.get<BackendMovie>(`/api/movies/${id}`);
      return movieApi.adaptBackendMovie(response.data);
    } catch {
      return null;
    }
  },

  async createMovie(data: Partial<AdminMovie>): Promise<BackendMovie> {
    const durationNum = parseInt(data.duration?.replace(/\D/g, '') || '120', 10);
    const response = await apiClient.post<BackendMovie>('/api/movies', {
      title: data.title || '',
      originalTitle: data.title || '',
      description: 'Phim đang được cập nhật thông tin.',
      durationMinutes: durationNum,
      releaseDate: new Date().toISOString(),
      posterUrl: data.poster || '',
      genre: data.genre || 'Hành Động',
      status: data.status === 'upcoming' ? 0 : 1, // 0 = ComingSoon, 1 = NowShowing
      rating: data.rating || 9.0,
      ageRating: data.age || 'C16',
      director: data.director || '',
      cast: '',
      formats: '2D Phụ Đề,IMAX Laser',
      backdropUrl: data.poster || '',
      trailerUrl: ''
    });
    return response.data;
  },

  async updateMovie(id: string | number, data: Partial<AdminMovie>): Promise<void> {
    const durationNum = parseInt(data.duration?.replace(/\D/g, '') || '120', 10);
    await apiClient.put(`/api/movies/${id}`, {
      title: data.title || '',
      originalTitle: data.title || '',
      description: 'Thông tin phim được cập nhật.',
      durationMinutes: durationNum,
      releaseDate: new Date().toISOString(),
      posterUrl: data.poster || '',
      genre: data.genre || 'Hành Động',
      status: data.status === 'upcoming' ? 0 : 1,
      rating: data.rating || 9.0,
      ageRating: data.age || 'C16',
      director: data.director || '',
      cast: '',
      formats: '2D Phụ Đề,IMAX Laser',
      backdropUrl: data.poster || '',
      trailerUrl: ''
    });
  },

  async deleteMovie(id: string | number): Promise<void> {
    await apiClient.delete(`/api/movies/${id}`);
  },

  adaptBackendMovie(m: BackendMovie): MovieItem {
    const formatsList = m.formats
      ? m.formats.split(',').map((f) => f.trim()).filter(Boolean)
      : ['2D Phụ Đề', 'IMAX Laser'];

    return {
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle || m.title,
      status: m.status === 1 || m.status === 'NowShowing' ? 'showing' : 'upcoming',
      genre: m.genre || 'Hành Động',
      duration: m.durationMinutes || 120,
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('vi-VN') : 'Đang cập nhật',
      rating: m.rating ?? 9.0,
      ageRating: (m.ageRating as any) || 'C16',
      director: m.director || 'Đạo diễn CINEVERSE',
      cast: m.cast || 'Dàn diễn viên điện ảnh',
      formats: formatsList.length > 0 ? formatsList : ['2D Phụ Đề', 'IMAX Laser'],
      poster: m.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      backdrop: m.backdropUrl || m.posterUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
      synopsis: m.description || 'Thông tin phim đang được cập nhật.',
      trailerUrl: m.trailerUrl || 'https://www.youtube.com/embed/Way9Dexny3w'
    };
  }
};
