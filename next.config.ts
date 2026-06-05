import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /* Allow LAN access to dev resources (HMR, JS chunks) when previewing on
     a phone via the LAN URL. Next 16 blocks cross-origin dev requests by
     default — without these origins, the page renders its static HTML but
     hydration JS never loads, so the splash stays visible forever. */
  allowedDevOrigins: ["192.168.10.77", "*.local"],
};

export default nextConfig;
