import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { formatVND } from '../../utils/formatters';

export const MyTicketsView: React.FC = () => {
  const { myTickets, cancelTicket, openTicketQr, navigateTo, concessions } = useBooking();

  return (
    <section id="view-mytickets" className="page-view animate-fade-in py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Tủ Vé Điện Tử
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              Vé Của Tôi & Lịch Sử Đặt Vé
            </h2>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="w-fit px-4 py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cinema-red/30"
          >
            <i className="fa-solid fa-plus"></i> Đặt Thêm Vé Mới
          </button>
        </div>

        {myTickets.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
            <i className="fa-solid fa-ticket text-4xl text-gray-600 mb-3 block"></i>
            <h3 className="text-lg font-bold text-white">Bạn chưa có vé xem phim nào</h3>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Hãy đặt vé ngay để thưởng thức những siêu phẩm điện ảnh đỉnh cao!
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="px-6 py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-cinema-red/30 transition"
            >
              Khám Phá Phim Ngay
            </button>
          </div>
        ) : (
          <div id="mytickets-list" className="space-y-5">
            {myTickets.map((ticket) => {
              const isCancelled = ticket.status === 'cancelled';
              const seatsText = ticket.seats.map((s) => s.code).join(', ');

              const combosList = Object.entries(ticket.combos)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const c = concessions.find((item) => item.id.toString() === id.toString());
                  return `${qty}x ${c?.name ? c.name.split('(')[0].trim() : `Combo #${id}`}`;
                });
              const combosText = combosList.length > 0 ? combosList.join(', ') : 'Không có';

              return (
                <div
                  key={ticket.id}
                  className={`glass-panel rounded-3xl p-5 sm:p-6 border ${
                    isCancelled ? 'border-white/5 opacity-60' : 'border-white/15'
                  } flex flex-col md:flex-row items-center justify-between gap-6 transition`}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full md:w-auto">
                    <img
                      src={ticket.movie.poster}
                      alt={ticket.movie.title}
                      className="w-20 h-28 object-cover rounded-xl shadow"
                    />
                    <div className="text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                          {ticket.bookingCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCancelled
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isCancelled ? 'Đã Hủy Vé' : 'Vé Hợp Lệ'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{ticket.movie.title}</h3>
                      <p className="text-xs text-gray-300 mt-1">
                        <i className="fa-solid fa-location-dot text-cinema-red mr-1"></i>
                        {ticket.cinema.name} • {ticket.room}
                      </p>
                      <p className="text-xs text-amber-400 font-semibold mt-1">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {ticket.time} - {ticket.dateStr}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        Ghế: <strong className="text-white">{seatsText}</strong> | Bắp nước:{' '}
                        {combosText}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-gray-400">Tổng thanh toán</p>
                      <p className="text-lg font-display font-black text-white">
                        {formatVND(ticket.totalPaid)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled ? (
                        <>
                          <button
                            onClick={() => openTicketQr(ticket)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <i className="fa-solid fa-qrcode"></i> Xem QR Vé
                          </button>
                          <button
                            onClick={() => cancelTicket(ticket.bookingCode)}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-semibold transition"
                          >
                            Hủy vé
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Đã hoàn tiền vào ví</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

