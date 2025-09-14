import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: false,
  },
  // Handle webpack configuration for React compatibility
  webpack: (config, { isServer }) => {
    // Ensure proper React resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };
    
    return config;
  },
};

export default nextConfig;
