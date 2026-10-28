export type MovieStatus = 'NowShowing' | 'ComingSoon' | 'Ended';

export interface BackendMovie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  releaseDate: string;
  posterUrl: string;
  genre: string;
  status: number | MovieStatus;
  createdAt?: string;
}

export interface PagedMoviesResponse {
  total: number;
  page: number;
  pageSize: number;
  items: BackendMovie[];
}

export interface MovieItem {
  id: number;
  title: string;
  originalTitle: string;
  status: 'showing' | 'upcoming';
  genre: string;
  duration: number;
  releaseDate: string;
  rating: number;
  ageRating: 'P' | 'C13' | 'C16' | 'C18';
  director: string;
  cast: string;
  formats: string[];
  poster: string;
  backdrop: string;
  synopsis: string;
  trailerUrl?: string;
}

