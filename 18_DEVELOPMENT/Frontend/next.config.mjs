/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // output: 'export', // Disabled static export to support dynamic API routes & SSR deployment

  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gujarattourism.gov.in',
      },
    ],
  },
};

export default nextConfig;
