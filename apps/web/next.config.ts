import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
  typescript: {
    // Suppress TypeScript errors during build — type errors won't abort deployment
    ignoreBuildErrors: true,
  },
}

export default nextConfig
