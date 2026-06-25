/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/de",
        destination: "/",
        permanent: true,
      },
      {
        source: "/de/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
    ];
  },
};
module.exports = nextConfig;
