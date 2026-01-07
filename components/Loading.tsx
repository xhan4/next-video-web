'use client';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
}

export const Loading = ({ size = 'default', tip, fullScreen = false }: LoadingProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'h-full'}`}>
      <Spin size={size} indicator={antIcon} tip={tip} />
    </div>
  );
};

// 全局加载状态
export const GlobalLoading = ({ tip = '加载中...' }: { tip?: string }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <Loading size="large" tip={tip} />
    </div>
  );
};