'use client';

import { Image } from '@chakra-ui/react';

interface AppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'favicon' | 'android' | 'apple';
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ 
  size = 'md', 
  variant = 'favicon',
  className 
}) => {
  const sizeMap = {
    sm: '16px',
    md: '32px',
    lg: '64px',
    xl: '128px'
  };

  const iconMap = {
    favicon: '/images/favicon-32x32.png',
    android: '/images/android-chrome-192x192.png',
    apple: '/images/android-chrome-512x512.png'
  };

  return (
    <Image
      src={iconMap[variant]}
      alt="应用图标"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      borderRadius="md"
    />
  );
};

// 预定义的图标组件
export const FaviconIcon = (props: Omit<AppIconProps, 'variant'>) => 
  <AppIcon variant="favicon" {...props} />;

export const AndroidIcon = (props: Omit<AppIconProps, 'variant'>) => 
  <AppIcon variant="android" {...props} />;

export const AppleIcon = (props: Omit<AppIconProps, 'variant'>) => 
  <AppIcon variant="apple" {...props} />;