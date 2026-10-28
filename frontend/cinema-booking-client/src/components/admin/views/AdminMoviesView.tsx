import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatVND, getAgeBadgeColor } from '../../../utils/formatters';

export const AdminMoviesView: React.FC = () => {
  const { movies, openMovieModal, deleteMovie } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMovies = movies.filter((m) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <section id="mod-movies" className="module-view space-y-6 animate-fade-in">
      {/* Toolbar Quản Lý Phim */}
      <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên phim, đạo diễn, thể loại..."
              className="w-full bg-admin-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-admin-crimson transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 outline-none focus:border-admin-crimson transition"
          >
            <option value="all">Tất cả trạng thái phim</option>
            <option value="showing">Đang khởi chiếu</option>
            <option value="upcoming">Sắp khởi chiếu</option>
            <option value="ended">Đã ngừng chiếu</option>
          </select>
        </div>

        <button
          onClick={() => openMovieModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-admin-crimson to-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-admin-crimson/25 flex items-center justify-center gap-2 shrink-0 transition"
        >
          <i className="fa-solid fa-plus"></i> Thêm Phim Mới
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-admin-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-admin-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-3.5 px-4">Thông Tin Phim</th>
                <th className="py-3.5 px-4">Thể Loại & Thời Lượng</th>
                <th className="py-3.5 px-4">Phân Loại / IMDb</th>
                <th className="py-3.5 px-4">Giá Vé Cơ Bản</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy phim nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => {
                  const statusBadge =
                    m.status === 'showing' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Đang chiếu
                      </span>
                    ) : m.status === 'upcoming' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        Sắp chiếu
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                        Ngừng chiếu
                      </span>
                    );

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-11 h-16 object-cover rounded-lg shrink-0 border border-slate-700 shadow"
                          />
                          <div>
                            <p className="font-bold text-white text-sm line-clamp-1">{m.title}</p>
                            <p className="text-xs text-slate-400">ĐD: {m.director}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{m.genre}</p>
                        <p className="text-xs text-slate-400">
                          <i className="fa-regular fa-clock mr-1"></i>
                          {m.duration}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${getAgeBadgeColor(
                              m.age
                            )}`}
                          >
                            {m.age}
                          </span>
                          <span className="font-bold text-amber-400 text-xs">
                            <i className="fa-solid fa-star text-[10px] mr-1"></i>
                            {m.rating}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatVND(m.basePrice)}
                      </td>
                      <td className="py-3.5 px-4">{statusBadge}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openMovieModal(m)}
                          title="Sửa thông tin phim"
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => deleteMovie(m.id)}
                          title="Xóa phim"
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition inline-flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

