import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/ceo-dashboard', destination: '/dashboard',       permanent: true },
      { source: '/marketing',     destination: '/get-leads',       permanent: true },
      { source: '/sales',         destination: '/get-sales',       permanent: true },
      { source: '/fulfillment',   destination: '/keep-customers',  permanent: true },
      { source: '/media-hub',     destination: '/inbox',           permanent: true },
    ];
  },
};

export default nextConfig;
