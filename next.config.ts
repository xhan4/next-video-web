import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // 确保环境变量在构建时可用
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
  },
    // 基础路径配置（用于Nginx代理在/video路径下）
  basePath:'/video',
  // 静态资源前缀配置（解决静态资源404问题）
  assetPrefix:'/video',
  // 输出模式配置
  output: 'standalone',
  // 重写配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://laicuinan.cn/nest/:path*',
      },
      {
        source: '/user/:path*',
        destination: 'https://laicuinan.cn/nest/user/:path*',
      },
      {
        source: '/video-ai/:path*',
        destination: 'https://laicuinan.cn/nest/video-ai/:path*',
      },
    ];
  }
};

export default nextConfig;