/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/imagelab' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/imagelab' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
