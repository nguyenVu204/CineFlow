import { apiClient } from './client';
import { BackendMovie, MovieItem, PagedMoviesResponse } from '../../types/movie';
import { MOVIES_DATA } from '../mock/moviesData';

export const movieApi = {
  async getMovies(params?: {
    search?: string;
    genre?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<MovieItem[]> {
    try {
      const response = await apiClient.get<PagedMoviesResponse>('/api/movies', { params });
      if (response.data && response.data.items && response.data.items.length > 0) {
        return response.data.items.map((m) => movieApi.adaptBackendMovie(m));
      }
      return MOVIES_DATA;
    } catch {
      // Backend not running or empty -> return mock movies
      return MOVIES_DATA;
    }
  },

  async getMovieById(id: number): Promise<MovieItem> {
    try {
      const response = await apiClient.get<BackendMovie>(`/api/movies/${id}`);
      return movieApi.adaptBackendMovie(response.data);
    } catch {
      const found = MOVIES_DATA.find((m) => m.id === id);
      return found || MOVIES_DATA[0];
    }
  },

  adaptBackendMovie(m: BackendMovie): MovieItem {
    const mock = MOVIES_DATA.find((mockItem) => mockItem.id === m.id || mockItem.title.toLowerCase() === m.title.toLowerCase());
    return {
      id: m.id,
      title: m.title,
      originalTitle: mock ? mock.originalTitle : m.title,
      status: m.status === 1 || m.status === 'NowShowing' ? 'showing' : 'upcoming',
      genre: m.genre || (mock ? mock.genre : 'Hành Động'),
      duration: m.durationMinutes || (mock ? mock.duration : 120),
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('vi-VN') : (mock ? mock.releaseDate : 'Đang cập nhật'),
      rating: mock ? mock.rating : 9.0,
      ageRating: mock ? mock.ageRating : 'C16',
      director: mock ? mock.director : 'Đạo diễn CINEVERSE',
      cast: mock ? mock.cast : 'Diễn viên CINEVERSE',
      formats: mock ? mock.formats : ['2D Phụ Đề', 'IMAX Laser'],
      poster: m.posterUrl || (mock ? mock.poster : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'),
      backdrop: mock ? mock.backdrop : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
      synopsis: m.description || (mock ? mock.synopsis : 'Thông tin phim đang được cập nhật.'),
      trailerUrl: mock?.trailerUrl
    };
  }
};
