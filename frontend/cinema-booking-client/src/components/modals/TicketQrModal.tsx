import React from 'react';
import { useBooking } from '../../context/BookingContext';

export const TicketQrModal: React.FC = () => {
  const { ticketQrModalData, closeTicketQr } = useBooking();

  if (!ticketQrModalData) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    ticketQrModalData.bookingCode
  )}`;

  const seatsText = ticketQrModalData.seats.map((s) => s.code).join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-sm w-full p-6 border border-white/15 text-center relative animate-fade-in shadow-2xl">
        <button
          onClick={closeTicketQr}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <h3 className="text-lg font-bold text-white mb-1 font-display">Mã Check-in Rạp</h3>
        <p className="text-xs text-gray-400 mb-4">
          Xuất trình mã này cho nhân viên soát vé tại rạp
        </p>

        <div className="bg-white p-3 rounded-2xl inline-block shadow-xl mb-3">
          <img src={qrUrl} alt="Ticket QR" className="w-48 h-48" />
        </div>

        <p className="text-xl font-mono font-black text-amber-400 tracking-wider mb-2">
          {ticketQrModalData.bookingCode}
        </p>
        <p className="text-sm font-bold text-white line-clamp-1">
          {ticketQrModalData.movie.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {ticketQrModalData.time} ({ticketQrModalData.dateStr}) - Ghế: {seatsText}
        </p>
      </div>
    </div>
  );
};

