import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许手机通过局域网 IP 访问开发服务器
  allowedDevOrigins: ['192.168.31.209'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 静态资源缓存：歌曲文件 & 封面图 30 天强缓存
  async headers() {
    return [
      {
        source: '/songs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=259200, immutable' },
        ],
      },
      {
        source: '/images/covers/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=259200, immutable' },
        ],
      },
    ]
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
