import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';

export const AdminMovieModal: React.FC = () => {
  const { movieModal, closeMovieModal, saveMovie } = useAdmin();
  const { isOpen, editingMovie } = movieModal;

  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState('Khoa Học Viễn Tưởng');
  const [duration, setDuration] = useState('145 phút');
  const [age, setAge] = useState<'P' | 'C13' | 'C16' | 'C18'>('C16');
  const [rating, setRating] = useState(9.0);
  const [basePrice, setBasePrice] = useState(95000);
  const [status, setStatus] = useState<'showing' | 'upcoming' | 'ended'>('showing');
  const [poster, setPoster] = useState(
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
  );

  useEffect(() => {
    if (editingMovie) {
      setTitle(editingMovie.title);
      setDirector(editingMovie.director);
      setGenre(editingMovie.genre);
      setDuration(editingMovie.duration);
      setAge(editingMovie.age);
      setRating(editingMovie.rating);
      setBasePrice(editingMovie.basePrice);
      setStatus(editingMovie.status);
      setPoster(editingMovie.poster);
    } else {
      setTitle('');
      setDirector('');
      setGenre('Khoa Học Viễn Tưởng');
      setDuration('145 phút');
      setAge('C16');
      setRating(9.0);
      setBasePrice(95000);
      setStatus('showing');
      setPoster('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80');
    }
  }, [editingMovie, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMovie({
      id: editingMovie?.id,
      title,
      director,
      genre,
      duration,
      age,
      rating,
      basePrice,
      status,
      poster
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-admin-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-slate-700 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <h3 className="text-lg font-display font-black text-white">
            {editingMovie ? 'Cập Nhật Phim Điện Ảnh' : 'Thêm Phim Điện Ảnh Mới'}
          </h3>
          <button
            onClick={closeMovieModal}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-admin-crimson text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Tên phim tiếng Việt *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hành Tinh Cát: Phần Hai"
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Đạo diễn *</label>
              <input
                type="text"
                required
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="VD: Denis Villeneuve"
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Thể loại *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              >
                <option value="Khoa Học Viễn Tưởng">Khoa Học Viễn Tưởng</option>
                <option value="Hành Động">Hành Động</option>
                <option value="Kinh Dị">Kinh Dị</option>
                <option value="Hoạt Hình">Hoạt Hình</option>
                <option value="Tình Cảm">Tình Cảm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Thời lượng *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Giới hạn tuổi</label>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value as any)}
                  className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
                >
                  <option value="P">P (Mọi lứa tuổi)</option>
                  <option value="C13">C13 (13+)</option>
                  <option value="C16">C16 (16+)</option>
                  <option value="C18">C18 (18+)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Điểm IMDb</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Giá vé cơ bản (đ)</label>
                <input
                  type="number"
                  step="5000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
                >
                  <option value="showing">Đang chiếu</option>
                  <option value="upcoming">Sắp chiếu</option>
                  <option value="ended">Ngừng chiếu</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-semibold">URL Ảnh Poster *</label>
              <input
                type="url"
                required
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeMovieModal}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-admin-crimson to-amber-500 text-white font-extrabold shadow-lg shadow-admin-crimson/25 transition"
            >
              Lưu Thông Tin Phim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

