import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';

export const AdminShowtimesView: React.FC = () => {
  const {
    movies,
    showtimes,
    createShowtime,
    deleteShowtime,
    soldSeats,
    maintSeats,
    toggleSeatMaintenance,
    unlockAllMaintenanceSeats
  } = useAdmin();

  const [movieTitle, setMovieTitle] = useState(
    movies[0]?.title || 'Hành Tinh Cát: Phần Hai'
  );
  const [room, setRoom] = useState('Phòng IMAX 01');
  const [format, setFormat] = useState('IMAX Laser 3D');
  const [time, setTime] = useState('20:15');
  const [date, setDate] = useState('2025-03-28');

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const totalSeats = 70; // 7 rows x 10 cols
  const occupiedCount = soldSeats.length;
  const maintCount = maintSeats.length;
  const availableCount = Math.max(0, totalSeats - occupiedCount - maintCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShowtime({
      movieTitle,
      room,
      format,
      time,
      date
    });
  };

  return (
    <section id="mod-showtimes" className="module-view space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Create Showtime + Active Schedule List */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-admin-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-calendar-plus text-admin-crimson"></i> Tạo Suất Chiếu Mới
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Chọn Phim Chiếu *</label>
                <select
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  required
                  className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.title}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phòng Chiếu *</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  >
                    <option value="Phòng IMAX 01">Phòng IMAX 01</option>
                    <option value="Phòng 4DX 02">Phòng 4DX 02</option>
                    <option value="Phòng Gold Class">Phòng Gold Class</option>
                    <option value="Phòng Laser 03">Phòng Laser 03</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Định Dạng *</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  >
                    <option value="IMAX Laser 3D">IMAX Laser 3D</option>
                    <option value="4DX Tuyệt Đỉnh">4DX Tuyệt Đỉnh</option>
                    <option value="Dolby Atmos 2D">Dolby Atmos 2D</option>
                    <option value="2D Phụ Đề">2D Phụ Đề</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Giờ Chiếu *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Ngày Chiếu *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-admin-crimson hover:bg-rose-600 text-white font-bold shadow-lg shadow-admin-crimson/20 transition"
              >
                + Phát Hành Lịch Chiếu
              </button>
            </form>
          </div>

          {/* Showtime List */}
          <div className="bg-admin-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Danh Sách Suất Chiếu</h3>
              <span className="text-xs text-amber-400 font-bold">{showtimes.length} suất chiếu</span>
            </div>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {showtimes.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-admin-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-admin-crimson/20 border border-admin-crimson/40 text-rose-300 font-mono font-black text-sm">
                      {st.time}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{st.movieTitle}</p>
                      <p className="text-[11px] text-amber-400">
                        {st.room} • {st.format} • {st.date}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteShowtime(st.id)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs shrink-0 transition flex items-center justify-center"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Auditorium Seat Map Inspector */}
        <div className="xl:col-span-7 bg-admin-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-screwdriver-wrench text-amber-400"></i> Sơ Đồ Quản Lý &
                Khóa Ghế Phòng Chiếu
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhấp vào từng ghế để chuyển đổi:{' '}
                <strong className="text-slate-200">Ghế Trống</strong> →{' '}
                <strong className="text-amber-400">Khóa Bảo Trì</strong> →{' '}
                <strong className="text-rose-400">Đã Đặt</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={unlockAllMaintenanceSeats}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-xs font-bold border border-slate-700 transition"
              >
                Mở khóa tất cả bảo trì
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Ghế Trống</p>
              <p className="text-lg font-bold text-emerald-400">{availableCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Đang Khóa Bảo Trì</p>
              <p className="text-lg font-bold text-amber-400">{maintCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Khách Đã Đặt</p>
              <p className="text-lg font-bold text-rose-400">{occupiedCount}</p>
            </div>
          </div>

          {/* Glowing Curved Screen */}
          <div className="auditorium-screen flex items-center justify-center">
            <span className="text-[10px] font-display font-bold tracking-[0.25em] text-slate-300 uppercase mt-1">
              MÀN HÌNH PHÒNG CHIẾU IMAX
            </span>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[520px] flex flex-col items-center gap-2 mx-auto">
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-bold text-slate-500 text-center">{row}</span>

                  {Array.from({ length: 10 }, (_, idx) => {
                    const col = idx + 1;
                    const code = `${row}${col}`;
                    const isMaint = maintSeats.includes(code);
                    const isSold = soldSeats.includes(code);

                    return (
                      <React.Fragment key={code}>
                        {(col === 3 || col === 9) && <div className="w-3"></div>}
                        <button
                          onClick={() => toggleSeatMaintenance(code)}
                          title={`${code} (${
                            isMaint ? 'Bảo trì' : isSold ? 'Đã đặt' : 'Trống'
                          })`}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                            isMaint
                              ? 'seat-maint-pattern border-amber-400 text-amber-400'
                              : isSold
                              ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {isMaint ? (
                            <i className="fa-solid fa-wrench text-[10px]"></i>
                          ) : (
                            code
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}

                  <span className="w-5 text-xs font-bold text-slate-500 text-center">{row}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 mt-4 border-t border-slate-800 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-slate-800 border border-slate-600 inline-block"></span>{' '}
              Trống (Mở bán)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded seat-maint-pattern border border-amber-400 inline-block"></span>{' '}
              Đang khóa bảo trì
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-600/30 border border-rose-500 inline-block"></span>{' '}
              Khách đã đặt
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

