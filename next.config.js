/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
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
      ],
    };
  },
};
