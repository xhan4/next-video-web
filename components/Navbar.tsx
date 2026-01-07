'use client';

import { clearAuth, getUser, isAuthenticated } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">视频生成平台</h1>
          </div>
          <div className="flex items-center">
            {isAuth && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">欢迎, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
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