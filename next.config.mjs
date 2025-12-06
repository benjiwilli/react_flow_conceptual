import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Explicitly set tracing root to avoid multi-lockfile warnings
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  compress: true,
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
    ],
  },
  // Webpack configuration for client-side
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent node-specific modules from being bundled client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
}

export default nextConfig
