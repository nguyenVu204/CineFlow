import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { movieApi } from '../../services/api/movieApi';
import { cinemaApi } from '../../services/api/cinemaApi';
import { MovieItem } from '../../types/movie';
import { CinemaItem, ShowtimeSlot } from '../../types/cinema';
import { getAgeBadgeColor } from '../../utils/formatters';

export const MovieDetailView: React.FC = () => {
  const {
    selectedMovieId,
    selectedDateIndex,
    selectDate,
    selectedCity,
    selectCity,
    selectShowtimeAndGoToSeats,
    navigateTo,
    openTrailer
  } = useBooking();

  const [movie, setMovie] = useState<MovieItem | null>(null);
  const [cinemas, setCinemas] = useState<CinemaItem[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeSlot[]>([]);

  useEffect(() => {
    movieApi.getMovieById(selectedMovieId).then((m) => setMovie(m));
    cinemaApi.getCinemas().then((c) => setCinemas(c));
    cinemaApi.getShowtimes(selectedMovieId).then((st) => setShowtimes(st));
  }, [selectedMovieId]);

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label = i === 0 ? 'Hôm nay' : d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dateShort = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    return { label, dateShort, index: i };
  });

  const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];

  const filteredCinemas = cinemas.filter((c) => {
    const city = c.city as string;
    return (
      city === selectedCity ||
      (selectedCity === 'TP. Hồ Chí Minh' && city === 'TP.HCM') ||
      (selectedCity === 'TP.HCM' && (city === 'TP. Hồ Chí Minh' || city === 'TP.HCM'))
    );
  });

  if (!movie) {
    return (
      <div className="py-24 text-center text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-cinema-red"></i>
        <p>Đang tải thông tin phim...</p>
      </div>
    );
  }

  return (
    <section id="view-detail" className="page-view animate-fade-in">
      {/* Movie Backdrop Header */}
      <div className="relative w-full py-12 bg-cinema-900 border-b border-white/10 overflow-hidden">
        <div
          id="detail-backdrop"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-md scale-105"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigateTo('home')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition"
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách phim
          </button>

          <div id="detail-movie-info" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 max-w-[280px] mx-auto">
                <img src={movie.poster} alt={movie.title} className="w-full h-auto object-cover" />
                <button
                  onClick={() => openTrailer(movie)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition group"
                >
                  <div className="w-16 h-16 rounded-full bg-cinema-red text-white flex items-center justify-center text-xl shadow-xl group-hover:scale-110 transition">
                    <i className="fa-solid fa-play ml-1"></i>
                  </div>
                </button>
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-black ${getAgeBadgeColor(
                    movie.ageRating
                  )}`}
                >
                  Phân loại {movie.ageRating}
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
                  <i className="fa-solid fa-star mr-1"></i> {movie.rating}/10 Đánh giá
                </span>
                {movie.formats.map((f, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-display font-black text-white">
                  {movie.title}
                </h1>
                <p className="text-sm text-amber-400 font-semibold mt-1">{movie.originalTitle}</p>
              </div>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
                {movie.synopsis}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-sm">
                <div>
                  <span className="text-gray-400">Đạo diễn:</span>{' '}
                  <strong className="text-white ml-1">{movie.director}</strong>
                </div>
                <div>
                  <span className="text-gray-400">Thể loại:</span>{' '}
                  <strong className="text-white ml-1">{movie.genre}</strong>
                </div>
                <div>
                  <span className="text-gray-400">Thời lượng:</span>{' '}
                  <strong className="text-white ml-1">{movie.duration} phút</strong>
                </div>
                <div>
                  <span className="text-gray-400">Khởi chiếu:</span>{' '}
                  <strong className="text-white ml-1">{movie.releaseDate}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400">Diễn viên:</span>{' '}
                  <strong className="text-gray-200 ml-1">{movie.cast}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Selection Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 bg-cinema-red rounded-full"></div>
          <h2 className="text-2xl font-display font-bold text-white">Lịch Chiếu & Chọn Suất</h2>
        </div>

        {/* Step 1: 7-Day Date Selector */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            1. Chọn Ngày Xem Phim (7 ngày tới)
          </label>
          <div id="detail-dates-list" className="flex items-center gap-3 overflow-x-auto pb-2">
            {next7Days.map((d) => {
              const active = d.index === selectedDateIndex;
              return (
                <button
                  key={d.index}
                  onClick={() => selectDate(d.index)}
                  className={`min-w-[110px] px-4 py-3 rounded-2xl border text-center transition shrink-0 ${
                    active
                      ? 'bg-cinema-red border-cinema-red text-white shadow-lg shadow-cinema-red/30'
                      : 'bg-cinema-900 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <p className={`text-xs font-medium ${active ? 'text-red-100' : 'text-gray-400'}`}>
                    {d.label}
                  </p>
                  <p className="text-base font-extrabold mt-0.5">{d.dateShort}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: City / Region Filter */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            2. Chọn Khu Vực Cụm Rạp
          </label>
          <div id="detail-cities-list" className="flex flex-wrap items-center gap-2.5">
            {cities.map((city) => {
              const active =
                selectedCity === city ||
                (selectedCity === 'TP.HCM' && city === 'TP. Hồ Chí Minh') ||
                (selectedCity === 'TP. Hồ Chí Minh' && city === 'TP.HCM');
              return (
                <button
                  key={city}
                  onClick={() => selectCity(city)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                    active
                      ? 'bg-amber-500 text-cinema-950 shadow-lg shadow-amber-500/20'
                      : 'bg-cinema-900 text-gray-300 border border-white/10 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-location-dot mr-1.5"></i>
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Cinemas & Showtime Slots */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            3. Chọn Rạp & Khung Giờ Chiếu
          </label>
          <div id="detail-showtimes-container" className="space-y-4">
            {filteredCinemas.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-gray-400">
                Chưa có lịch chiếu tại khu vực này trong ngày đã chọn.
              </div>
            ) : (
              filteredCinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cinema-red"></span>
                        {cinema.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{cinema.address}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg w-fit">
                      <i className="fa-solid fa-couch mr-1"></i> Còn nhiều ghế đẹp
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {showtimes.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => selectShowtimeAndGoToSeats(slot, cinema)}
                        className="group p-3 rounded-xl bg-cinema-900 hover:bg-cinema-red border border-white/10 hover:border-cinema-red text-center transition-all"
                      >
                        <p className="text-base font-extrabold text-white group-hover:scale-105 transition-transform">
                          {slot.time}
                        </p>
                        <p className="text-[10px] font-semibold text-amber-400 group-hover:text-white mt-0.5">
                          {slot.format}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
