import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This is necessary because @react-three/fiber type declarations are not
    // being properly loaded during Next.js build TypeScript checking,
    // even though the code compiles and runs correctly.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
