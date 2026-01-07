'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/localStorage';
import VideoGenerator from '@/components/VideoGenerator';
import { Box, Text } from '@chakra-ui/react';

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

  // 如果未登录，显示加载状态
  if (!isAuthenticated()) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Text>正在检查登录状态...</Text>
      </Box>
    );
  }

  return (
    <Box minH="calc(100vh - 80px)" bg="gray.50" pt={4}>
      <VideoGenerator />
    </Box>
  );
}