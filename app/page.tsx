'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/localStorage';
import VideoGenerator from '@/components/VideoGenerator';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录，如果未登录则重定向到登录页
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              <VideoGenerator />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}