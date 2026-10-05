import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/calculator', destination: '/calculator.html', permanent: false }];
  },
};
export default config;
