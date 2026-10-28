import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';

export const AdminUserModal: React.FC = () => {
  const { userModal, closeUserModal, saveUser } = useAdmin();
  const { isOpen, editingUser } = userModal;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Quản trị viên' | 'Nhân viên soát vé' | 'Khách hàng VIP' | 'Thành viên'>('Thành viên');
  const [points, setPoints] = useState(150);
  const [status, setStatus] = useState<'active' | 'locked'>('active');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setPhone(editingUser.phone);
      setRole(editingUser.role);
      setPoints(editingUser.points);
      setStatus(editingUser.status);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('Thành viên');
      setPoints(150);
      setStatus('active');
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUser({
      id: editingUser?.id,
      name,
      email,
      phone,
      role,
      points,
      status
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-admin-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <h3 className="text-lg font-display font-black text-white">
            {editingUser ? 'Cập Nhật Người Dùng' : 'Thêm Người Dùng Mới'}
          </h3>
          <button
            onClick={closeUserModal}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-admin-crimson text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Họ và tên *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@cineverse.vn"
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Vai trò hệ thống *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              >
                <option value="Thành viên">Thành viên</option>
                <option value="Khách hàng VIP">Khách hàng VIP</option>
                <option value="Nhân viên soát vé">Nhân viên soát vé</option>
                <option value="Quản trị viên">Quản trị viên (Admin)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Điểm tích lũy</label>
              <input
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Trạng thái tài khoản</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-admin-crimson transition"
            >
              <option value="active">Đang hoạt động</option>
              <option value="locked">Tạm khóa tài khoản</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeUserModal}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-admin-crimson hover:bg-rose-600 text-white font-extrabold shadow-lg shadow-admin-crimson/25 transition"
            >
              Lưu Người Dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

