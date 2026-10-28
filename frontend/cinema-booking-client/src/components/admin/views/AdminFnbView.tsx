import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatVND } from '../../../utils/formatters';

export const AdminFnbView: React.FC = () => {
  const {
    fnb,
    vouchers,
    addFnb,
    toggleFnbStock,
    deleteFnb,
    addVoucher,
    toggleVoucherActive,
    deleteVoucher
  } = useAdmin();

  // F&B form state
  const [fnbName, setFnbName] = useState('');
  const [fnbPrice, setFnbPrice] = useState(95000);
  const [fnbDesc, setFnbDesc] = useState('');

  // Voucher form state
  const [vcCode, setVcCode] = useState('');
  const [vcTitle, setVcTitle] = useState('');
  const [vcType, setVcType] = useState<'fixed' | 'percent'>('fixed');
  const [vcVal, setVcVal] = useState(50000);

  const handleFnbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnbName.trim() || !fnbDesc.trim()) return;
    addFnb(fnbName, fnbPrice, fnbDesc);
    setFnbName('');
    setFnbDesc('');
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vcCode.trim() || !vcTitle.trim()) return;
    addVoucher(vcCode, vcTitle, vcType, vcVal);
    setVcCode('');
    setVcTitle('');
  };

  return (
    <section id="mod-fnb" className="module-view space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: F&B Combos */}
        <div className="lg:col-span-6 bg-admin-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-popcorn text-amber-400"></i> Quản Lý Thực Đơn Bắp Nước
              </h3>
              <p className="text-xs text-slate-400">
                Thêm mới hoặc bật/tắt trạng thái mở bán tại quầy
              </p>
            </div>
          </div>

          <form
            onSubmit={handleFnbSubmit}
            className="p-4 rounded-xl bg-admin-950 border border-slate-800 space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={fnbName}
                onChange={(e) => setFnbName(e.target.value)}
                placeholder="Tên Combo bắp nước..."
                className="sm:col-span-2 bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              />
              <input
                type="number"
                required
                value={fnbPrice}
                onChange={(e) => setFnbPrice(Number(e.target.value))}
                placeholder="Giá (VNĐ)"
                step="1000"
                className="bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={fnbDesc}
                onChange={(e) => setFnbDesc(e.target.value)}
                placeholder="Mô tả chi tiết thành phần combo..."
                className="flex-1 bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shrink-0 transition"
              >
                + Thêm Combo
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {fnb.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-admin-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{item.name}</h4>
                    {item.inStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                        Tạm hết
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  <p className="text-xs font-bold text-amber-400 mt-1">{formatVND(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFnbStock(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    {item.inStock ? 'Báo hết' : 'Mở bán'}
                  </button>
                  <button
                    onClick={() => deleteFnb(item.id)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Discount Vouchers */}
        <div className="lg:col-span-6 bg-admin-900 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-ticket-simple text-admin-crimson"></i> Chiến Dịch Mã Giảm
                Giá Voucher
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý mã khuyến mãi giảm theo % hoặc số tiền
              </p>
            </div>
          </div>

          <form
            onSubmit={handleVoucherSubmit}
            className="p-4 rounded-xl bg-admin-950 border border-slate-800 space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={vcCode}
                onChange={(e) => setVcCode(e.target.value)}
                placeholder="Mã (VD: VIP50)"
                className="bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase outline-none focus:border-admin-crimson transition"
              />
              <select
                value={vcType}
                onChange={(e) => setVcType(e.target.value as any)}
                className="bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              >
                <option value="fixed">Giảm tiền (VNĐ)</option>
                <option value="percent">Giảm theo %</option>
              </select>
              <input
                type="number"
                required
                value={vcVal}
                onChange={(e) => setVcVal(Number(e.target.value))}
                placeholder="50000 hoặc 20"
                className="bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={vcTitle}
                onChange={(e) => setVcTitle(e.target.value)}
                placeholder="Tên chương trình khuyến mãi..."
                className="flex-1 bg-admin-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-admin-crimson transition"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-admin-crimson hover:bg-rose-600 text-white font-extrabold shrink-0 transition"
              >
                + Phát Hành
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {vouchers.map((vc) => (
              <div
                key={vc.code}
                className="p-4 rounded-xl bg-admin-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                      {vc.code}
                    </span>
                    {vc.active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Đang chạy
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                        Tạm dừng
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white mt-1">{vc.title}</h4>
                  <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                    {vc.type === 'percent'
                      ? `Giảm ${vc.value}% tổng hóa đơn`
                      : `Giảm ${formatVND(vc.value)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleVoucherActive(vc.code)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    {vc.active ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    onClick={() => deleteVoucher(vc.code)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

