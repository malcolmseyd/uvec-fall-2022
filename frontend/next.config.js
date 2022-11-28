/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    API_URL: "badapi.mnt.dev",
  },
};

module.exports = nextConfig;
