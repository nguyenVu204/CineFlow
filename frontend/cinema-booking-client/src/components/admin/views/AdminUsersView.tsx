import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';

export const AdminUsersView: React.FC = () => {
  const { users, openUserModal, toggleUserLock, deleteUser } = useAdmin();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <section id="mod-users" className="module-view space-y-6 animate-fade-in">
      {/* Filter & Action Bar */}
      <div className="bg-admin-900 p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo họ tên, email, số điện thoại..."
              className="w-full bg-admin-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-admin-crimson transition"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 outline-none focus:border-admin-crimson transition"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Quản trị viên">Quản trị viên (Admin)</option>
            <option value="Nhân viên soát vé">Nhân viên soát vé</option>
            <option value="Khách hàng VIP">Khách hàng VIP</option>
            <option value="Thành viên">Thành viên thường</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-admin-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 outline-none focus:border-admin-crimson transition"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>

        <button
          onClick={() => openUserModal()}
          className="px-5 py-2.5 rounded-xl bg-admin-crimson hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-admin-crimson/25 flex items-center justify-center gap-2 shrink-0 transition"
        >
          <i className="fa-solid fa-user-plus"></i> Thêm Người Dùng Mới
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-admin-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-admin-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-3.5 px-4">Người Dùng</th>
                <th className="py-3.5 px-4">Liên Hệ (Email / SĐT)</th>
                <th className="py-3.5 px-4">Vai Trò</th>
                <th className="py-3.5 px-4">Điểm Tích Lũy</th>
                <th className="py-3.5 px-4">Ngày Tham Gia</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge =
                    u.role === 'Quản trị viên' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-admin-crimson/20 text-rose-300 border border-admin-crimson/30">
                        {u.role}
                      </span>
                    ) : u.role === 'Nhân viên soát vé' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {u.role}
                      </span>
                    ) : u.role === 'Khách hàng VIP' ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {u.role}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {u.role}
                      </span>
                    );

                  const initials = u.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center justify-center shrink-0 text-xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{u.email}</p>
                        <p className="text-[11px] text-slate-400">{u.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">{roleBadge}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        <i className="fa-solid fa-coins mr-1 text-xs"></i>
                        {u.points.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{u.joined}</td>
                      <td className="py-3.5 px-4">
                        {u.status === 'active' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openUserModal(u)}
                          title="Sửa thông tin"
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center justify-center text-xs"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => toggleUserLock(u.id)}
                          title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          className={`w-8 h-8 rounded-lg transition inline-flex items-center justify-center text-xs ${
                            u.status === 'active'
                              ? 'bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`}
                        >
                          <i
                            className={`fa-solid ${u.status === 'active' ? 'fa-lock' : 'fa-lock-open'}`}
                          ></i>
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          title="Xóa tài khoản"
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

