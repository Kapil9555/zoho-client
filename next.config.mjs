/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tech4logic-images.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tech4logicstore.blob.core.windows.net',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'tech4logicstorewebsite.blob.core.windows.net', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
