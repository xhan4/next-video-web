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
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      
      if (response.code === 0) {
        setAuth(response.data);
        toast({
          title: '登录成功',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
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
      toast({
        title: '网络错误',
        description: '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="gray.50"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={12}
    >
      <Card
        maxW="md"
        w="full"
        shadow="xl"
        borderRadius="xl"
        border="none"
      >
        <CardBody p={8}>
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
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  rightIcon={<ArrowForwardIcon />}
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
              <Button variant="link" colorScheme="blue" size="sm">
                立即注册
              </Button>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}