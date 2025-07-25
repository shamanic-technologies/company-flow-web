/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Set the output directory for the build
  distDir: '.next',
  // Required for Vercel deployment
  output: 'standalone',

  // These headers are required for SharedArrayBuffer, which is used by WebContainers.
  // See: https://web.dev/coop-coep/
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

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
  transpilePackages: ["lucide-react", "@agent-base/api-client", "@tremor/react"],
  webpack: (config, { isServer }) => {
    // Improve path alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src')
    };
    
    // Define paths to be ignored by the watcher using glob patterns
    config.watchOptions = {
      ignored: [
        '**/.git/**',        // Ignore .git folder and its contents
        '**/node_modules/**', // Ignore all node_modules folders and their contents
        '**/.next/**',        // Ignore all .next folders and their contents
        '**/.turbo/**',       // Ignore all .turbo folders and their contents
        '**/dist/**',         // Ignore all dist folders and their contents
      ],
    };
    
    return config;
  }
};

module.exports = nextConfig; 