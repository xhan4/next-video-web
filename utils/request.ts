import { ApiResponse } from '@/types';
import { getAuthToken, getRefreshToken, setAuth, clearAuth } from './localStorage';
import { refreshToken } from '@/lib/global';

const API_BASE = 'http://localhost:3002';

// Token刷新函数
const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return false;
    }

    const response = await refreshToken({ refresh_token: currentRefreshToken });
    if (response.code === 0) {
      // 更新本地存储的token
      const authData = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
      };
      setAuth(authData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token刷新失败:', error);
    return false;
  }
};

// 通用请求函数
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE}${endpoint}`;
  let token = getAuthToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'x-app-id': 'WEB_ADMIN',
  };

  // 如果有token，添加到请求头
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // 检查token是否过期
    if (response.status === 401) {
      // 尝试刷新token
      const refreshSuccess = await refreshAuthToken();
      if (refreshSuccess) {
        // 重新发起请求
        token = getAuthToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
          const retryResponse = await fetch(url, config);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new Error(retryData.msg || '请求失败');
          }
          
          return retryData;
        }
      } else {
        // 刷新失败，清除认证信息并重定向到登录页
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('认证已过期，请重新登录');
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || '请求失败');
    }
    
    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

export default request;