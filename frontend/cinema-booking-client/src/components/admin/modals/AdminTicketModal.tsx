import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatVND } from '../../../utils/formatters';

export const AdminTicketModal: React.FC = () => {
  const { ticketModal, closeTicketModal } = useAdmin();
  const { isOpen, ticket } = ticketModal;

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-admin-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-700 shadow-2xl">
        <div className="bg-gradient-to-r from-admin-crimson to-amber-600 px-6 py-4 flex items-center justify-between">
          <span className="font-display font-black text-sm text-white uppercase tracking-wider">
            <i className="fa-solid fa-ticket mr-2"></i>Chi Tiết Vé Điện Tử
          </span>
          <button
            onClick={closeTicketModal}
            className="w-7 h-7 rounded-lg bg-black/25 text-white flex items-center justify-center hover:bg-black/50 transition"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <h4 className="text-base font-display font-black text-white">{ticket.movieTitle}</h4>
            <p className="text-xs text-amber-400 font-semibold mt-0.5">
              {ticket.room} • {ticket.datetime}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-admin-950 border border-dashed border-slate-700 flex flex-col items-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.code}`}
              alt="QR"
              className="w-36 h-36 rounded-xl bg-white p-2 mb-2"
            />
            <span className="font-mono font-black text-base text-amber-400 tracking-widest">
              {ticket.code}
            </span>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Khách hàng:</span>
              <span className="font-bold text-white">
                {ticket.customerName} ({ticket.customerPhone})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ghế ngồi:</span>
              <span className="font-extrabold text-admin-crimson">
                {ticket.seats.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Combo F&B:</span>
              <span className="font-semibold text-white">{ticket.combos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tổng tiền:</span>
              <span className="font-black text-amber-400">{formatVND(ticket.totalPaid)}</span>
            </div>
          </div>

          <button
            onClick={closeTicketModal}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-admin-crimson text-white font-bold text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

