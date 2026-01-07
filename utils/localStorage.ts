import { LoginResponse, UserInfo } from '@/types';

// 存储认证信息
export const setAuth = (authData: LoginResponse): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('userInfo', JSON.stringify(authData.userInfo));
  }
};

// 获取认证token
export const getAuthToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

// 获取刷新token
export const getRefreshToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken') || '';
  }
  return '';
};

// 获取用户信息
export const getUserInfo = (): UserInfo | null => {
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }
  return null;
};

// 清除认证信息
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  }
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('authToken');
  return !!token;
};

// 退出登录
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};