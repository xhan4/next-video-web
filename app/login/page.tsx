'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Card,
  CardBody,
  VStack,
  Text,
  Divider,
  HStack,
  useToast,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { login } from '@/lib/global';
import { setAuth } from '@/utils/localStorage';

// 将登录表单组件提取出来，以便在 Suspense 中使用
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const redirectUrl = searchParams.get('redirect') || '/';

  // 确保在客户端才渲染，避免水合不匹配
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!username.trim() || !password.trim()) {
      toast({
        title: '请输入完整的登录信息',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      
      if (response.code === 0) {
        setAuth(response.data);
        toast({
          title: '登录成功',
          status: 'success',
          duration: 1000,
          isClosable: true,
        });
        
        // 短暂延迟后跳转，让用户看到成功提示
        setTimeout(() => {
          // 直接跳转到目标页面，不需要强制刷新
          router.replace(redirectUrl);
        }, 800);
      } else {
        toast({
          title: '登录失败',
          description: response.msg || '请检查用户名和密码',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('登录错误:', err);
      toast({
        title: '网络错误',
        description: '请检查网络连接后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 在客户端状态确定之前，显示统一的加载状态
  if (!isClient) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={12}
    >
      {/* 登录表单 */}
      <Card
        maxW="md"
        w="full"
        shadow="xl"
        borderRadius="xl"
        border="none"
        position="relative"
        overflow="hidden"
      >
        <CardBody p={8} position="relative" zIndex={1}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={3} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                用户登录
              </Text>
              <Text color="gray.500" fontSize="sm">
                请输入您的账户信息
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>用户名</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <EmailIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="请输入用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      size="lg"
                      disabled={isLoading}
                      bg="white"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>密码</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      disabled={isLoading}
                      bg="white"
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="登录中..."
                  rightIcon={!isLoading ? <ArrowForwardIcon /> : undefined}
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </VStack>
            </form>

            <Divider />

            <VStack spacing={2}>
              <Text color="gray.500" fontSize="sm">
                还没有账户？
              </Text>
              <Button variant="link" colorScheme="blue" size="sm" disabled={isLoading}>
                立即注册
              </Button>
            </VStack>
          </VStack>
        </CardBody>

        {/* 简化的Loading覆盖层 */}
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="whiteAlpha.900"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={2}
          >
            <Center>
              <VStack spacing={4}>
                <Spinner 
                  size="xl" 
                  color="blue.500" 
                  thickness="3px"
                  speed="0.65s"
                  emptyColor="gray.200"
                />
                <Text color="blue.600" fontWeight="medium" fontSize="lg">
                  正在登录...
                </Text>
              </VStack>
            </Center>
          </Box>
        )}
      </Card>
    </Box>
  );
}

// 主页面组件，使用 Suspense 包装
export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    }>
      <LoginForm />
    </Suspense>
  );
}