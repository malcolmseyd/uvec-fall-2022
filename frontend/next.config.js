/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    API_URL: "malcolmseyd-2.gl.srv.us",
  }
}

module.exports = nextConfig
