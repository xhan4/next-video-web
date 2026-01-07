'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/localStorage';
import VideoGenerator from '@/components/VideoGenerator';
import { Box, Text, Spinner } from '@chakra-ui/react';

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    // 检查是否已登录，如果未登录则重定向到登录页
    if (isClient && !isLoggedIn) {
      router.push('/login');
    }
  }, [isClient, isLoggedIn, router]);

  // 在客户端状态确定之前，显示统一的加载状态
  if (!isClient) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  // 如果未登录，显示加载状态
  if (!isLoggedIn) {
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