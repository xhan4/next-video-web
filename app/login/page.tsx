'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const redirectUrl = searchParams.get('redirect') || '/';

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
          router.push(redirectUrl);
          router.refresh(); // 强制刷新页面状态
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

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={12}
      position="relative"
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
        transition="all 0.3s ease"
        transform={isLoading ? 'scale(0.98)' : 'scale(1)'}
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
                      _disabled={{ bg: 'gray.50', opacity: 0.7 }}
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
                      _disabled={{ bg: 'gray.50', opacity: 0.7 }}
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
                  _disabled={{ opacity: 0.7 }}
                  transition="all 0.2s"
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

        {/* 优化的Loading覆盖层 */}
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="whiteAlpha.800"
            backdropFilter="blur(8px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={2}
            animation="fadeIn 0.3s ease"
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}