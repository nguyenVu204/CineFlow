import { useEffect, useState } from 'react';

interface Movie {
  id: number;
  title: string;
  genre: string;
  description: string;
  durationMinutes: number;
  posterUrl: string;
  status: string;
}

interface Showtime {
  id: number;
  movieId: number;
  screenId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: string;
}

const API_BASE = 'http://localhost:5000';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [message, setMessage] = useState('Loading movies...');

  useEffect(() => {
    fetch(`${API_BASE}/api/movies`)
      .then((response) => response.json())
      .then((payload) => {
        const items = Array.isArray(payload) ? payload : payload.items ?? [];
        setMovies(items);
        if (items.length > 0) {
          setSelectedMovieId(items[0].id);
        }
      })
      .catch(() => setMessage('Unable to connect to gateway. Start the backend services first.'));
  }, []);

  useEffect(() => {
    if (!selectedMovieId) {
      return;
    }

    fetch(`${API_BASE}/api/showtimes?movieId=${selectedMovieId}`)
      .then((response) => response.json())
      .then((data) => setShowtimes(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Unable to fetch showtimes for the selected movie.'));
  }, [selectedMovieId]);

  const handleHoldSeat = async () => {
    if (!selectedMovieId || showtimes.length === 0) {
      setMessage('Select a movie and showtime to continue.');
      return;
    }

    const showtimeId = showtimes[0].id;
    const requestBody = {
      showtimeId,
      seatIds: [1, 2],
      userId: 'customer-1'
    };

    try {
      const response = await fetch(`${API_BASE}/api/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const payload = await response.json();
      setMessage(payload.success ? `Seat hold successful: ${payload.bookingCode}` : payload.message || 'Seat hold failed');
    } catch (error) {
      setMessage('Unable to create a hold request.');
    }
  };

  const selectedMovie = movies.find((movie) => movie.id === selectedMovieId) ?? movies[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Cinema Booking</p>
          <h1>Movie Booking Demo</h1>
        </div>
        <button className="primary-button" onClick={handleHoldSeat}>Hold seats</button>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="tag">Demo flow</p>
          <h2>Choose a movie, select a showtime, reserve seats and confirm booking.</h2>
          <p>{message}</p>
        </div>
      </section>

      <section className="movie-list">
        {movies.map((movie) => (
          <button
            key={movie.id}
            className={`movie-card ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
            onClick={() => setSelectedMovieId(movie.id)}
          >
            <div className="poster" style={{ backgroundImage: `url(${movie.posterUrl})` }} />
            <div className="movie-meta">
              <h3>{movie.title}</h3>
              <p>{movie.genre}</p>
              <span>{movie.status}</span>
            </div>
          </button>
        ))}
      </section>

      {selectedMovie && (
        <section className="details-panel">
          <div>
            <h3>{selectedMovie.title}</h3>
            <p>{selectedMovie.description}</p>
            <small>{selectedMovie.durationMinutes} minutes • {selectedMovie.genre}</small>
          </div>
          <div className="showtime-grid">
            {showtimes.length > 0 ? (
              showtimes.map((showtime) => (
                <div key={showtime.id} className="showtime-item">
                  <strong>{new Date(showtime.startTime).toLocaleString()}</strong>
                  <span>{showtime.status}</span>
                </div>
              ))
            ) : (
              <p>No showtimes available yet.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
