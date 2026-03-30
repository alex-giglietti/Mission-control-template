import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      { source: '/ceo-dashboard', destination: '/dashboard',      permanent: true },
      { source: '/marketing',     destination: '/get-leads',      permanent: true },
      { source: '/sales',         destination: '/get-sales',      permanent: true },
      { source: '/fulfillment',   destination: '/keep-customers', permanent: true },
      { source: '/media-hub',     destination: '/inbox',          permanent: true },
    ];
  },
};

export default nextConfig;
