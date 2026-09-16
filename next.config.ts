import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Layout tests must never replace the production service's .next output.
  distDir: process.env.LAYOUT_TEST_MODE === "1" ? ".next-layout" : ".next",
  devIndicators: process.env.LAYOUT_TEST_MODE === "1" ? false : undefined,
};

export default nextConfig;
