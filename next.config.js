/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Set the output directory for the build
  distDir: '.next',
  // Required for Vercel deployment
  output: 'standalone',
  // Allow images from external domains
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ["lucide-react", "@agent-base/api-client"],
  webpack: (config, { isServer }) => {
    // Améliorer la résolution des alias de chemins
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './')
    };
    
    return config;
  }
};

module.exports = nextConfig; 