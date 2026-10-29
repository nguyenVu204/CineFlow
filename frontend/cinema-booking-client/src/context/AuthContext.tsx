import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrentUser, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../services/api/authApi';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  addPoints: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('cineverse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      localStorage.setItem('cineverse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cineverse_user');
      localStorage.removeItem('cineverse_token');
    }
  }, [user]);

  // Refresh profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('cineverse_token');
    if (token) {
      authApi.getMe().then((me) => {
        setUser((prev) => prev ? {
          ...prev,
          name: me.displayName,
          points: me.points,
          phone: me.phoneNumber || prev.phone,
          roles: me.roles
        } : {
          id: me.id,
          email: me.email,
          name: me.displayName,
          phone: me.phoneNumber,
          points: me.points,
          roles: me.roles,
          status: me.status,
          token
        });
      }).catch(() => {
        // token expired
      });
    }
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      const res = await authApi.login(data);
      const loggedUser: CurrentUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.displayName,
        phone: res.user.phoneNumber,
        points: res.user.points,
        roles: res.user.roles || ['Customer'],
        status: res.user.status,
        token: res.accessToken
      };
      localStorage.setItem('cineverse_token', res.accessToken);
      setUser(loggedUser);
      showToast(`Đăng nhập thành công! Chào mừng ${loggedUser.name}`, 'success');
      closeAuthModal();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!';
      showToast(msg, 'error');
      return false;
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const res = await authApi.register(data);
      const newUser: CurrentUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.displayName,
        phone: res.user.phoneNumber,
        points: res.user.points,
        roles: res.user.roles || ['Customer'],
        status: res.user.status,
        token: res.accessToken
      };
      localStorage.setItem('cineverse_token', res.accessToken);
      setUser(newUser);
      showToast(`Đăng ký tài khoản thành công! Bạn nhận được +${newUser.points} điểm CINEVERSE Club.`, 'success');
      closeAuthModal();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!';
      showToast(msg, 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cineverse_token');
    localStorage.removeItem('cineverse_user');
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.addPoints(amount);
      setUser((prev) => prev ? { ...prev, points: updatedUser.points } : null);
    } catch {
      setUser((prev) => prev ? { ...prev, points: prev.points + amount } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        addPoints
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
