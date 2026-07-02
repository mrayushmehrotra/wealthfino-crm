import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    importScripts: ["/sw-push-handler.js"],
  },
})

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
}

export default withPWA(nextConfig)
