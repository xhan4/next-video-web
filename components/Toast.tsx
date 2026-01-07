'use client';

import { useToast } from '@chakra-ui/react';

// 简化Toast组件，直接使用Chakra UI的useToast
export const useCustomToast = () => {
  const toast = useToast();

  return {
    success: (message: string) => {
      toast({
        title: message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    error: (message: string) => {
      toast({
        title: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    warning: (message: string) => {
      toast({
        title: message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    },
    info: (message: string) => {
      toast({
        title: message,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
  };
};