'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, clearAuth } from '@/utils/localStorage';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">视频生成平台</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">欢迎，{user.nickname || user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  退出登录
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}