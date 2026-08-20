import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: "/knowledge-hub",
        destination: "/knowledge-hub-static/index.html"
      },
      {
        source: "/knowledge-hub/:path*",
        destination: "/knowledge-hub-static/:path*"
      }
    ];
  },
  turbopack: {
    root: path.resolve(process.cwd())
  }
};

export default nextConfig;
