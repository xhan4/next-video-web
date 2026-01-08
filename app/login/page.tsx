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
  Image,
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
        title: '请输入完整信息',
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
          duration: 800,
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
          description: response.msg || '用户名或密码错误',
          status: 'error',
         isClosable: true,
        });
      }
    } catch (err) {
      console.error('登录错误:', err);
      toast({
        title: '网络错误',
        description: '请检查网络连接',
        status: 'error',
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
      px={{ base: 3, md: 4 }}
      py={{ base: 6, md: 12 }}
    >
      {/* 登录表单 */}
      <Card
        maxW={{ base: "full", md: "md" }}
        w="full"
        shadow="xl"
        borderRadius={{ base: "lg", md: "xl" }}
        border="none"
        position="relative"
        overflow="hidden"
      >
        <CardBody p={{ base: 6, md: 8 }} position="relative" zIndex={1}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <VStack spacing={{ base: 2, md: 3 }} textAlign="center">
              <HStack spacing={{ base: 2, md: 3 }}>
                <Image
                  src="/video/android-chrome-192x192.png"
                  alt="Logo"
                  width={{ base: "28px", md: "32px" }}
                  height={{ base: "28px", md: "32px" }}
                />
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.700">
                  用户登录
                </Text>
              </HStack>
              <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
                请输入您的账户信息
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={{ base: 3, md: 4 }}>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>用户名</FormLabel>
                  <InputGroup>
                    <InputLeftElement height="100%" display="flex" alignItems="center">
                      <EmailIcon color="gray.400" boxSize={{ base: "18px", md: "20px" }} />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="请输入用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      size={{ base: "md", md: "lg" }}
                      disabled={isLoading}
                      bg="white"
                      pl={{ base: "45px", md: "50px" }}
                      fontSize={{ base: "sm", md: "md" }}
                      height={{ base: "40px", md: "48px" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>密码</FormLabel>
                  <InputGroup>
                    <InputLeftElement height="100%" display="flex" alignItems="center">
                      <LockIcon color="gray.400" boxSize={{ base: "18px", md: "20px" }} />
                    </InputLeftElement>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      disabled={isLoading}
                      bg="white"
                      pl="50px" // 为图标留出空间
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size={{ base: "md", md: "lg" }}
                  w="full"
                  isLoading={isLoading}
                  loadingText="登录中..."
                  rightIcon={!isLoading ? <ArrowForwardIcon /> : undefined}
                  disabled={isLoading}
                  fontSize={{ base: "sm", md: "md" }}
                  height={{ base: "40px", md: "48px" }}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </VStack>
            </form>

            <Divider />

            <VStack spacing={{ base: 1, md: 2 }}>
              <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
                还没有账户？
              </Text>
              <Button 
                variant="link" 
                colorScheme="blue" 
                size={{ base: "xs", md: "sm" }} 
                disabled={isLoading}
                fontSize={{ base: "xs", md: "sm" }}>
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
            bg="whiteAlpha.800"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={2}
            backdropFilter="blur(2px)"
          >
            <VStack spacing={{ base: 2, md: 3 }}>
              <Spinner 
                size={{ base: "md", md: "lg" }}
                color="blue.500" 
                thickness="2px"
                speed="0.8s"
                emptyColor="gray.100"
              />
              <Text color="blue.600" fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                登录中...
              </Text>
            </VStack>
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