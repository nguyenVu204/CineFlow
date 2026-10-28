import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cinema-900 border-t border-white/10 mt-16 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cinema-red to-amber-500 flex items-center justify-center shadow-lg shadow-cinema-red/30">
                <i className="fa-solid fa-film text-white text-base"></i>
              </div>
              <span className="font-display font-black text-xl tracking-wider text-white">
                CINE<span className="text-cinema-red">VERSE</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao chuẩn quốc tế với hệ thống máy chiếu IMAX Laser 4K và âm thanh vòm Dolby Atmos thế hệ mới nhất.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cinema-red hover:text-white flex items-center justify-center text-gray-300 transition-colors"
              >
                <i className="fa-brands fa-facebook-f text-sm"></i>
              </a>
              <a
                href="#youtube"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cinema-red hover:text-white flex items-center justify-center text-gray-300 transition-colors"
              >
                <i className="fa-brands fa-youtube text-sm"></i>
              </a>
              <a
                href="#tiktok"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cinema-red hover:text-white flex items-center justify-center text-gray-300 transition-colors"
              >
                <i className="fa-brands fa-tiktok text-sm"></i>
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-display">Cụm Rạp Trọng Điểm</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-cinema-red mt-0.5"></i>
                <span>CINEVERSE Vincom Royal City (Hà Nội)</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-cinema-red mt-0.5"></i>
                <span>CINEVERSE Metropolis Liễu Giai (Hà Nội)</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-cinema-red mt-0.5"></i>
                <span>CINEVERSE Landmark 81 IMAX (TP.HCM)</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot text-cinema-red mt-0.5"></i>
                <span>CINEVERSE Cầu Rồng Sông Hàn (Đà Nẵng)</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-display">Chăm Sóc Khách Hàng</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                Hotline hỗ trợ: <strong className="text-amber-400 font-bold">1900 6868</strong> (8:00 - 23:00)
              </li>
              <li>Email: cskh@cineverse.vn</li>
              <li>Câu hỏi thường gặp & Hướng dẫn</li>
              <li>Chính sách hoàn tiền & Hủy vé</li>
              <li>Quy chế hoạt động thành viên</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-display">Tải Ứng Dụng</h4>
            <p className="text-xs text-gray-400 mb-3">
              Đặt vé nhanh chóng, tích lũy điểm thưởng và nhận thông báo ưu đãi độc quyền.
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="#appstore"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
              >
                <i className="fa-brands fa-apple text-2xl text-white"></i>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase leading-none">Download on</p>
                  <p className="text-xs font-bold text-white">App Store</p>
                </div>
              </a>
              <a
                href="#googleplay"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
              >
                <i className="fa-brands fa-google-play text-xl text-emerald-400"></i>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase leading-none">Get it on</p>
                  <p className="text-xs font-bold text-white">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>© 2025 CINEVERSE Vietnam Cinema Corp. All rights reserved. GPKD số 0108928372 do Sở KH&ĐT cấp.</p>
        </div>
      </div>
    </footer>
  );
};

