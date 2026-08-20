import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  typedRoutes: true,
  outputFileTracingIncludes: {
    "/knowledge-hub/*": ["./public/knowledge-hub-static/**/*"],
    "/knowledgehub/*": ["./public/knowledge-hub-static/**/*"]
  },
  turbopack: {
    root: path.resolve(process.cwd())
  }
};

export default nextConfig;
