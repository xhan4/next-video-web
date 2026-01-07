import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // 确保环境变量在构建时可用
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
  },
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
  },
};

export default nextConfig;