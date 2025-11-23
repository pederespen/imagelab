/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/imagelab',
  assetPrefix: '/imagelab',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
