import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  // Exclude v0-ver folder from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/supabase$': require.resolve('./src/lib/supabase/client.ts'),
    }
    return config
  },
};

export default nextConfig;
