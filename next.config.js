/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles:
        [
          {
            source: '/',
            destination: '/', // Keep all other paths for app subdomain
            has: [
              {
                type: 'host',
                value: 'ispentadollar.com', // Only for subdomain
              },
            ],
          },
          {
            source: '/',
            destination: '/dashboard', // Keep all other paths for app subdomain
            has: [
              {
                type: 'host',
                value: 'app.ispentadollar.com', // Only for subdomain
              },
            ],
          },
        ]
    }
  }
}
