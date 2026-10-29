import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { movieApi } from '../../services/api/movieApi';
import { cinemaApi } from '../../services/api/cinemaApi';
import { promotionApi } from '../../services/api/promotionApi';
import { MovieItem } from '../../types/movie';
import { CinemaItem, ShowtimeSlot } from '../../types/cinema';
import { AdminVoucher } from '../../types/admin';
import { getAgeBadgeColor } from '../../utils/formatters';

export const HomeView: React.FC = () => {
  const { openMovieDetail, quickBook, openTrailer } = useBooking();
  const { showToast } = useToast();

  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [cinemas, setCinemas] = useState<CinemaItem[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeSlot[]>([]);
  const [promotions, setPromotions] = useState<AdminVoucher[]>([]);

  // Hero state
  const [heroIndex, setHeroIndex] = useState(0);

  // Filter & Search
  const [movieTab, setMovieTab] = useState<'showing' | 'upcoming'>('showing');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick booking state
  const [qbMovieId, setQbMovieId] = useState<number | ''>('');
  const [qbCinemaId, setQbCinemaId] = useState<number | ''>('');
  const [qbDate, setQbDate] = useState<string>('');
  const [qbTime, setQbTime] = useState<string>('');

  // Fetch movies, cinemas, showtimes, promotions
  useEffect(() => {
    let mounted = true;
    movieApi.getMovies().then((data) => {
      if (mounted) {
        setMovies(data);
        if (data.length > 0) setQbMovieId(data[0].id);
      }
    });
    cinemaApi.getCinemas().then((data) => {
      if (mounted) {
        setCinemas(data);
        if (data.length > 0) setQbCinemaId(data[0].id);
      }
    });
    cinemaApi.getShowtimes().then((data) => {
      if (mounted) {
        setShowtimes(data);
        if (data.length > 0) setQbTime(data[0].time);
      }
    });
    promotionApi.getPromotions(true).then((data) => {
      if (mounted) {
        setPromotions(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Next 7 days list
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0
        ? 'Hôm nay'
        : d.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
          });
    return { label, value: label };
  });

  useEffect(() => {
    if (next7Days.length > 0 && !qbDate) {
      setQbDate(next7Days[0].value);
    }
  }, [next7Days, qbDate]);

  // Featured hero movies (first 3 movies)
  const heroMovies = movies.slice(0, 3);

  // Hero auto-advance every 7 seconds
  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const currentHero = heroMovies[heroIndex] || movies[0];

  const handleHeroChange = (dir: number) => {
    if (heroMovies.length === 0) return;
    setHeroIndex((prev) => {
      let next = prev + dir;
      if (next < 0) next = heroMovies.length - 1;
      if (next >= heroMovies.length) next = 0;
      return next;
    });
  };

  const handleQuickBookSubmit = () => {
    if (!qbMovieId || !qbCinemaId || !qbDate || !qbTime) {
      showToast('Vui lòng chọn đầy đủ thông tin đặt vé nhanh!', 'error');
      return;
    }
    quickBook(Number(qbMovieId), Number(qbCinemaId), qbDate, qbTime);
  };

  const copyPromo = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Đã sao chép mã ${code}! Nhập tại bước thanh toán để nhận ưu đãi.`, 'info');
  };

  // Filter movies
  const filteredMovies = movies.filter((m) => {
    const matchesTab = m.status === movieTab;
    const matchesGenre = selectedGenre === 'all' || m.genre.includes(selectedGenre);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.title.toLowerCase().includes(query) ||
      m.originalTitle.toLowerCase().includes(query) ||
      m.director.toLowerCase().includes(query);
    return matchesTab && matchesGenre && matchesSearch;
  });

  return (
    <section id="view-home" className="page-view animate-fade-in">
      {/* HERO SLIDER */}
      <div className="relative w-full h-[520px] sm:h-[580px] overflow-hidden bg-cinema-900">
        <div id="hero-slide-container" className="w-full h-full relative">
          {currentHero && (
            <div className="w-full h-full relative animate-fade-in" key={currentHero.id}>
              <img
                src={currentHero.backdrop}
                alt={currentHero.title}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/85 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-cinema-950/40"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
                <div className="max-w-2xl pb-12 sm:pb-8">
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-black ${getAgeBadgeColor(
                        currentHero.ageRating
                      )}`}
                    >
                      {currentHero.ageRating}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-400/30">
                      <i className="fa-solid fa-star mr-1"></i>
                      {currentHero.rating} IMDb
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cinema-red/20 text-red-400 text-xs font-bold border border-cinema-red/30">
                      IMAX LASER 4K
                    </span>
                    <span className="text-xs text-gray-300 font-medium">
                      <i className="fa-regular fa-clock mr-1"></i>
                      {currentHero.duration} phút
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight mb-2">
                    {currentHero.title}
                  </h1>
                  <p className="text-sm text-amber-400/90 font-semibold italic mb-4">
                    {currentHero.originalTitle} • {currentHero.genre}
                  </p>
                  <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed mb-7">
                    {currentHero.synopsis}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => openMovieDetail(currentHero.id)}
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cinema-red to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-cinema-red/40 flex items-center gap-2.5 transition transform hover:scale-105"
                    >
                      <i className="fa-solid fa-ticket text-base"></i> Đặt Vé Ngay
                    </button>
                    <button
                      onClick={() => openTrailer(currentHero)}
                      className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/15 text-white font-semibold text-sm flex items-center gap-2.5 border border-white/20 transition"
                    >
                      <i className="fa-solid fa-play text-cinema-red"></i> Xem Trailer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-24 sm:bottom-16 right-6 sm:right-12 z-20 flex items-center gap-2">
          <button
            onClick={() => handleHeroChange(-1)}
            className="w-10 h-10 rounded-full glass-panel hover:bg-cinema-red text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {heroMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  heroIndex === idx ? 'w-7 bg-cinema-red' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => handleHeroChange(1)}
            className="w-10 h-10 rounded-full glass-panel hover:bg-cinema-red text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* QUICK BOOKING FILTER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-30">
        <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80 border border-white/15">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-amber-400">
            <i className="fa-solid fa-bolt"></i> Đặt Vé Nhanh Chỉ Trong 30 Giây
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Select Movie */}
            <div className="relative">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">1. Chọn Phim</label>
              <select
                value={qbMovieId}
                onChange={(e) => setQbMovieId(Number(e.target.value))}
                className="w-full bg-cinema-900/90 border border-white/10 focus:border-cinema-red rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Select Cinema */}
            <div className="relative">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">2. Chọn Rạp</label>
              <select
                value={qbCinemaId}
                onChange={(e) => setQbCinemaId(Number(e.target.value))}
                className="w-full bg-cinema-900/90 border border-white/10 focus:border-cinema-red rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
              >
                {cinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Select Date */}
            <div className="relative">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">3. Chọn Ngày</label>
              <select
                value={qbDate}
                onChange={(e) => setQbDate(e.target.value)}
                className="w-full bg-cinema-900/90 border border-white/10 focus:border-cinema-red rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
              >
                {next7Days.map((d, i) => (
                  <option key={i} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Select Time */}
            <div className="relative">
              <label className="block text-[11px] text-gray-400 mb-1 ml-1">4. Suất Chiếu</label>
              <select
                value={qbTime}
                onChange={(e) => setQbTime(e.target.value)}
                className="w-full bg-cinema-900/90 border border-white/10 focus:border-cinema-red rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
              >
                {showtimes.map((s) => (
                  <option key={s.id} value={s.time}>
                    {s.time} ({s.format})
                  </option>
                ))}
              </select>
            </div>
            {/* Submit Quick Book */}
            <div className="flex items-end">
              <button
                onClick={handleQuickBookSubmit}
                className="w-full h-[42px] rounded-xl bg-gradient-to-r from-cinema-red to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-cinema-red/30 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <i className="fa-solid fa-ticket"></i> Đặt Vé Ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOVIES LISTING SECTION */}
      <div id="movies-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Tabs & Filters Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-white/10">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-cinema-900 p-1.5 rounded-2xl border border-white/10 w-fit">
            <button
              onClick={() => setMovieTab('showing')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                movieTab === 'showing'
                  ? 'bg-cinema-red text-white shadow-lg shadow-cinema-red/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-fire mr-1.5"></i>Phim Đang Chiếu
            </button>
            <button
              onClick={() => setMovieTab('upcoming')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                movieTab === 'upcoming'
                  ? 'bg-amber-500 text-cinema-950 font-bold shadow-lg shadow-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fa-regular fa-calendar-days mr-1.5"></i>Phim Sắp Chiếu
            </button>
          </div>

          {/* Search & Genre Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Pills */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-cinema-900 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-gray-200 outline-none"
            >
              <option value="all">Tất cả thể loại</option>
              <option value="Hành Động">Hành Động</option>
              <option value="Khoa Học Viễn Tưởng">Khoa Học Viễn Tưởng</option>
              <option value="Kinh Dị">Kinh Dị</option>
              <option value="Hoạt Hình">Hoạt Hình</option>
              <option value="Tình Cảm">Tình Cảm</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên phim, đạo diễn..."
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div id="movies-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {filteredMovies.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500">
              <i className="fa-solid fa-film text-4xl mb-3 block text-gray-600"></i>
              <p className="text-base font-semibold">Không tìm thấy bộ phim phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-cinema-red/60 transition-all duration-300 group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-cinema-900">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-transparent opacity-90"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-extrabold shadow ${getAgeBadgeColor(
                          movie.ageRating
                        )}`}
                      >
                        {movie.ageRating}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-400/30">
                        <i className="fa-solid fa-star text-[10px]"></i> {movie.rating}
                      </span>
                    </div>

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => openTrailer(movie)}
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-cinema-red text-white flex items-center justify-center backdrop-blur-md transition transform hover:scale-110"
                      >
                        <i className="fa-solid fa-play ml-0.5"></i>
                      </button>
                      <span className="text-xs font-semibold text-gray-200">Xem Trailer</span>
                    </div>

                    {/* Format Tags at Bottom of Poster */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                      {movie.formats.map((f, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/15 backdrop-blur-md text-[10px] font-bold text-white"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="p-4">
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                      {movie.genre} • {movie.duration} phút
                    </p>
                    <h3
                      onClick={() => openMovieDetail(movie.id)}
                      className="text-base font-bold text-white group-hover:text-cinema-red transition cursor-pointer line-clamp-1"
                    >
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{movie.originalTitle}</p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2">
                  <button
                    onClick={() => openMovieDetail(movie.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cinema-red to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-cinema-red/20 flex items-center justify-center gap-2 transition"
                  >
                    <i className="fa-solid fa-ticket"></i>{' '}
                    {movie.status === 'showing' ? 'Mua Vé Ngay' : 'Xem Lịch Sớm'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PROMOTIONS & OFFERS SECTION */}
      <div id="promotions-section" className="bg-cinema-900/60 border-y border-white/5 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cinema-red">
                Độc Quyền Thành Viên
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Ưu Đãi & Khuyến Mãi Hot
              </h2>
            </div>
            <p className="text-sm text-gray-400">Sao chép mã giảm giá để sử dụng ở bước thanh toán vé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo, idx) => {
              const color = idx % 3 === 0 ? 'red' : idx % 3 === 1 ? 'amber' : 'emerald';
              const borderHover =
                color === 'red'
                  ? 'hover:border-cinema-red/50'
                  : color === 'amber'
                  ? 'hover:border-amber-500/50'
                  : 'hover:border-emerald-500/50';

              const glowBg =
                color === 'red'
                  ? 'bg-cinema-red/15'
                  : color === 'amber'
                  ? 'bg-amber-500/15'
                  : 'bg-emerald-500/15';

              const badgeClass =
                color === 'red'
                  ? 'bg-cinema-red/20 text-cinema-red'
                  : color === 'amber'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400';

              const btnHover =
                color === 'red'
                  ? 'hover:bg-cinema-red'
                  : color === 'amber'
                  ? 'hover:bg-amber-500'
                  : 'hover:bg-emerald-600';

              const discountLabel =
                promo.type === 'percent'
                  ? `Giảm ${promo.value}%`
                  : `Giảm ${Number(promo.value).toLocaleString('vi-VN')}đ`;

              return (
                <div
                  key={promo.code}
                  className={`glass-panel rounded-2xl p-6 border border-white/10 ${borderHover} transition group relative overflow-hidden`}
                >
                  <div className={`absolute -right-8 -top-8 w-28 h-28 ${glowBg} rounded-full blur-xl`}></div>
                  <span className={`inline-block px-3 py-1 rounded-lg ${badgeClass} text-xs font-bold mb-3`}>
                    {discountLabel}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-5">
                    Áp dụng cho mọi giao dịch đặt vé trực tuyến trên hệ thống Cineverse.
                  </p>
                  <div className="flex items-center justify-between bg-cinema-950/80 p-2.5 rounded-xl border border-dashed border-white/20">
                    <code className="text-sm font-mono font-bold text-amber-400">{promo.code}</code>
                    <button
                      onClick={() => copyPromo(promo.code)}
                      className={`px-3 py-1 rounded-lg bg-white/10 ${btnHover} text-xs font-semibold text-white transition`}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
