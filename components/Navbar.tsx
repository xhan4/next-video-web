'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useBreakpointValue,
  Avatar,
  VStack,
  HStack,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  Image,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { isAuthenticated, clearAuth, getUserInfo } from '@/utils/localStorage';
import { UserInfo } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 使用简单的响应式逻辑，避免复杂的断点处理
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 在客户端设置响应式值
    const checkBreakpoint = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  // 更新用户信息的函数
  const updateUserInfo = () => {
    if (isClient && isAuthenticated()) {
      const user = getUserInfo();
      if (user) {
        setUserInfo(user);
      } else {
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    // 初始获取用户信息
    updateUserInfo();
  }, []);

  // 监听路径变化，当从登录页跳转过来时重新获取用户信息
  useEffect(() => {
    updateUserInfo();
  }, [pathname]);

  // 检查当前是否是登录页
  const isLoginPage = pathname === '/login';

  const handleLogout = () => {
    clearAuth();
    setUserInfo(null);
    if (isMobile) {
      onClose();
    }
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
    if (isMobile) {
      onClose();
    }
  };

  // 如果当前是登录页，则不显示导航栏
  if (isLoginPage) {
    return null;
  }

  // 移动端抽屉导航 - 使用更简单的逻辑避免状态不一致
  const MobileDrawer = () => {
    // 在抽屉内部重新获取用户信息，确保状态最新
    const [drawerUserInfo, setDrawerUserInfo] = useState<UserInfo | null>(null);
    const [drawerIsClient, setDrawerIsClient] = useState(false);

    useEffect(() => {
      setDrawerIsClient(true);
      // 抽屉打开时重新获取用户信息
      if (isOpen) {
        if (isAuthenticated()) {
          const user = getUserInfo();
          setDrawerUserInfo(user);
        } else {
          setDrawerUserInfo(null);
        }
      }
    }, [isOpen]);

    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {drawerIsClient ? (
              drawerUserInfo ? (
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Avatar size="sm" name={drawerUserInfo.nickname || drawerUserInfo.username} src={drawerUserInfo.avatar} />
                    <Text fontWeight="bold">{drawerUserInfo.nickname || drawerUserInfo.username}</Text>
                  </HStack>
                  {drawerUserInfo.username && (
                    <Text fontSize="sm" color="gray.600">账户: {drawerUserInfo.username}</Text>
                  )}
                </VStack>
              ) : (
                <Text>欢迎访问</Text>
              )
            ) : (
              <HStack>
                <Spinner size="sm" color="blue.500" />
                <Text>加载中...</Text>
              </HStack>
            )}
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {drawerIsClient ? (
                drawerUserInfo ? (
                  <Button 
                    variant="ghost" 
                    colorScheme="gray" 
                    size="md"
                    justifyContent="start"
                    onClick={handleLogout}
                    leftIcon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    }
                    borderRadius="lg"
                    borderWidth="0"
                    color="gray.600"
                    _hover={{
                      bg: 'gray.100',
                      color: 'red.500',
                      transform: 'translateX(4px)'
                    }}
                    _active={{
                      bg: 'gray.200'
                    }}
                    transition="all 0.2s ease-in-out"
                  >
                    退出登录
                  </Button>
                ) : (
                  <Button colorScheme="blue" size="md" onClick={handleLogin}>
                    登录
                  </Button>
                )
              ) : (
                <HStack justify="center">
                  <Spinner size="sm" color="blue.500" />
                  <Text fontSize="sm" color="gray.500">检查登录状态...</Text>
                </HStack>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  // 在客户端状态确定之前，显示统一的加载状态
  if (!isClient) {
    return (
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={4} py={3}>
        <Flex maxW="1200px" mx="auto" align="center" justify="center">
          <Spinner size="sm" color="blue.500" />
        </Flex>
      </Box>
    );
  }

  // PC端导航栏
  const DesktopNavbar = () => (
    <Flex align="center" justify="space-between" w="full">
      {/* 平台名称和图标 */}
      <HStack spacing={3}>
        <Image
          src="/video/android-chrome-192x192.png"
          alt="应用图标"
          width="32px"
          height="32px"
        />
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          视频生成平台
        </Text>
      </HStack>

      {/* 用户信息区域 */}
      <Flex align="center" gap={4}>
        {userInfo ? (
          <>
            {/* 客户信息 */}
            <Box textAlign="right">
              {userInfo.username && (
                <Text fontSize="sm" color="gray.600">账户: {userInfo.username}</Text>
              )}
            </Box>

            {/* 用户头像和下拉菜单 */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                leftIcon={<Avatar size="sm" name={userInfo.nickname || userInfo.username} src={userInfo.avatar} />}
              >
                {userInfo.nickname || userInfo.username}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={handleLogout}>退出登录</MenuItem>
              </MenuList>
            </Menu>
          </>
        ) : (
          <Button colorScheme="blue" onClick={handleLogin}>
            登录
          </Button>
        )}
      </Flex>
    </Flex>
  );

  // 移动端导航栏
  const MobileNavbar = () => (
    <Flex align="center" justify="space-between" w="full">
      {/* 平台名称和图标 */}
      <HStack spacing={3}>
        <Image
          src="/video/android-chrome-192x192.png"
          alt="Logo"
          width="32px"
          height="32px"
        />
        <Text fontSize="lg" fontWeight="bold" color="blue.600">
          视频生成平台
        </Text>
      </HStack>

      {/* 汉堡菜单 */}
      <IconButton
        aria-label="打开菜单"
        icon={<HamburgerIcon />}
        variant="ghost"
        onClick={onOpen}
      />
    </Flex>
  );

  // 主渲染逻辑 - 使用更简单的条件渲染避免Hydration错误
  return (
    <Box 
      bg="white" 
      shadow="sm" 
      borderBottom="1px" 
      borderColor="gray.200" 
      px={4} 
      py={3}
      position={isMobile ? 'fixed' : 'static'}
      top={isMobile ? "0" : undefined}
      left={isMobile ? "0" : undefined}
      right={isMobile ? "0" : undefined}
      zIndex={isMobile ? "sticky" : undefined}
      width="100%"
    >
      <Flex maxW="1200px" mx="auto" align="center">
        {/* 使用CSS媒体查询替代条件渲染 */}
        <Box display={{ base: 'none', md: 'block' }} width="100%">
          <DesktopNavbar />
        </Box>
        <Box display={{ base: 'block', md: 'none' }} width="100%">
          <MobileNavbar />
        </Box>
      </Flex>
      <MobileDrawer />
    </Box>
  );
}