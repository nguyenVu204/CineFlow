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
  addPoints: (amount: number) => void;
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

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      // Try backend first
      const res = await authApi.login(data);
      const loggedUser: CurrentUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.displayName,
        points: 1250,
        roles: res.user.roles || ['Customer'],
        token: res.accessToken
      };
      localStorage.setItem('cineverse_token', res.accessToken);
      setUser(loggedUser);
      showToast(`Đăng nhập thành công! Chào mừng ${loggedUser.name}`, 'success');
      closeAuthModal();
      return true;
    } catch {
      // Backend not running / offline -> Fallback mock auth
      if (data.email && data.password.length >= 6) {
        const fallbackUser: CurrentUser = {
          id: 'user_' + Date.now(),
          email: data.email,
          name: data.email.split('@')[0].toUpperCase(),
          points: 1250,
          roles: ['Customer'],
          token: 'mock_jwt_token_' + Date.now()
        };
        localStorage.setItem('cineverse_token', fallbackUser.token);
        setUser(fallbackUser);
        showToast(`Đăng nhập thành công (Demo Mode)! Chào mừng ${fallbackUser.name}`, 'success');
        closeAuthModal();
        return true;
      }
      showToast('Email hoặc mật khẩu không chính xác!', 'error');
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
        points: 500,
        roles: res.user.roles || ['Customer'],
        token: res.accessToken
      };
      localStorage.setItem('cineverse_token', res.accessToken);
      setUser(newUser);
      showToast('Đăng ký tài khoản thành công! Bạn nhận được +500 điểm CINEVERSE Club.', 'success');
      closeAuthModal();
      return true;
    } catch {
      // Fallback mock
      if (data.email && data.password.length >= 6 && data.displayName) {
        const fallbackUser: CurrentUser = {
          id: 'user_' + Date.now(),
          email: data.email,
          name: data.displayName,
          points: 500,
          roles: ['Customer'],
          token: 'mock_jwt_token_' + Date.now()
        };
        localStorage.setItem('cineverse_token', fallbackUser.token);
        setUser(fallbackUser);
        showToast('Đăng ký tài khoản thành công! Bạn nhận được +500 điểm CINEVERSE Club.', 'success');
        closeAuthModal();
        return true;
      }
      showToast('Vui lòng kiểm tra lại thông tin đăng ký!', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cineverse_token');
    localStorage.removeItem('cineverse_user');
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  const addPoints = (amount: number) => {
    if (!user) return;
    setUser({ ...user, points: user.points + amount });
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

