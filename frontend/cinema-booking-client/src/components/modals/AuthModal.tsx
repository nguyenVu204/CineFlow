import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setTab(authModalTab);
    setLoginError('');
    setRegError('');
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    setLoading(true);
    const success = await login({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (!success) {
      setLoginError('Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPassword) {
      setRegError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    const success = await register({
      email: regEmail,
      password: regPassword,
      displayName: regName
    });
    setLoading(false);
    if (!success) {
      setRegError('Đăng ký thất bại. Email có thể đã tồn tại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/15 shadow-2xl relative animate-fade-in">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Tab switch */}
        <div className="bg-cinema-950 p-1 rounded-2xl border border-white/10 flex mb-6">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-xl text-sm transition-all duration-200 ${
              tab === 'login'
                ? 'bg-cinema-red text-white font-bold shadow-md'
                : 'text-gray-400 hover:text-white font-semibold'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-xl text-sm transition-all duration-200 ${
              tab === 'register'
                ? 'bg-cinema-red text-white font-bold shadow-md'
                : 'text-gray-400 hover:text-white font-semibold'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nhapemail@gmail.com"
                required
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>

            {loginError && <p className="text-xs text-red-400 font-semibold">{loginError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cinema-red to-amber-600 hover:from-cinema-redGlow hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-cinema-red/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <span>Đăng Nhập Ngay</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-500 text-center pt-2">
              💡 Gợi ý trải nghiệm: Bạn có thể nhập email bất kỳ và mật khẩu từ 6 ký tự để đăng nhập.
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-cinema-900 border border-white/10 focus:border-cinema-red rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>

            {regError && <p className="text-xs text-red-400 font-semibold">{regError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-cinema-red hover:from-amber-400 hover:to-cinema-redGlow text-white font-bold rounded-xl shadow-lg shadow-cinema-red/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang tạo tài khoản...</span>
              ) : (
                <>
                  <i className="fa-solid fa-gift"></i>
                  <span>Tạo Tài Khoản (+500 Điểm Thưởng)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

