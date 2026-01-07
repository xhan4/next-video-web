import { LoginResponse } from '@/types';

// 存储认证信息
export const setAuth = (authData: LoginResponse): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
};

// 获取认证token
export const getAuthToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || '';
  }
  return '';
};

// 获取用户信息
export const getUser = (): any => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// 清除认证信息
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};