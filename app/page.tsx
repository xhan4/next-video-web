'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/localStorage';
import VideoGenerator from '@/components/VideoGenerator';
import { Box } from '@chakra-ui/react';

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
    <Box minH="100vh" bg="gray.50">
      <VideoGenerator />
    </Box>
  );
}