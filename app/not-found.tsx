"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // 隐藏导航栏
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    // 清理函数，在组件卸载时恢复导航栏
    return () => {
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - 页面未找到</h1>
      <p className="mt-4 text-gray-600">
        抱歉，您访问的页面不存在。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        返回首页
      </Link>
    </div>
  );
}