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
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
// 修改导入的函数名
import { isAuthenticated, clearAuth, getUserInfo } from '@/utils/localStorage';

interface UserInfo {
  username: string;
  email?: string;
  avatar?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // 响应式配置
  const isMobile = useBreakpointValue({ base: true, md: false });
  const showFullNav = useBreakpointValue({ base: false, md: true });

  // 检查当前是否是登录页
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // 检查用户是否已登录并获取用户信息
    if (isAuthenticated()) {
      const user = getUserInfo();
      if (user) {
        setUserInfo(user);
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuth(); // 修改为 clearAuth 而不是 logout
    setUserInfo(null);
    if (isMobile) {
      onClose();
    }
    // 退出后重定向到登录页
    window.location.href = '/login';
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

  // 移动端抽屉导航
  const MobileDrawer = () => (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {userInfo ? (
            <VStack align="start" spacing={2}>
              <HStack>
                <Avatar size="sm" name={userInfo.username} src={userInfo.avatar} />
                <Text fontWeight="bold">{userInfo.username}</Text>
              </HStack>
              {userInfo.email && (
                <Text fontSize="sm" color="gray.600">{userInfo.email}</Text>
              )}
            </VStack>
          ) : (
            <Text>欢迎访问</Text>
          )}
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch" mt={4}>
            {userInfo ? (
              <>
                <Button variant="ghost" justifyContent="start" onClick={handleLogout}>
                  退出登录
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={handleLogin}>
                登录
              </Button>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  // PC端导航栏
  const DesktopNavbar = () => (
    <Flex align="center" justify="space-between" w="full">
      {/* 平台名称 */}
      <Text fontSize="xl" fontWeight="bold" color="blue.600">
        视频生成平台
      </Text>

      {/* 用户信息区域 */}
      <Flex align="center" gap={4}>
        {userInfo ? (
          <>
            {/* 客户信息 */}
            <Box textAlign="right">
              <Text fontWeight="medium">{userInfo.username}</Text>
              {userInfo.email && (
                <Text fontSize="sm" color="gray.600">{userInfo.email}</Text>
              )}
            </Box>
            
            {/* 用户头像和下拉菜单 */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                leftIcon={<Avatar size="sm" name={userInfo.username} src={userInfo.avatar} />}
              >
                {userInfo.username}
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
      {/* 平台名称 */}
      <Text fontSize="lg" fontWeight="bold" color="blue.600">
        视频生成平台
      </Text>

      {/* 汉堡菜单 */}
      <IconButton
        aria-label="打开菜单"
        icon={<HamburgerIcon />}
        variant="ghost"
        onClick={onOpen}
      />
    </Flex>
  );

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={4} py={3}>
      <Flex maxW="1200px" mx="auto" align="center">
        {showFullNav ? <DesktopNavbar /> : <MobileNavbar />}
      </Flex>
      <MobileDrawer />
    </Box>
  );
}