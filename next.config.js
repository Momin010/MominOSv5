/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },

  // Fix cross-origin dev requests (✅ No wildcard!)
  allowedDevOrigins:
    process.env.NODE_ENV === 'development'
      ? ['https://a136ce04-0219-47b6-a197-7d7167c12130-00-3os7e6f32copg.picard.replit.dev']
      : [],

  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
