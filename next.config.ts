import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/* ─── Content Security Policy ───────────────────────────────────────────────
   Static (non-nonce) policy: a nonce CSP requires a proxy and forces every
   page to render dynamically, which would defeat the static/ISR rendering
   this site relies on. 'unsafe-inline' for script/style is required by
   Next's inline hydration scripts and the theme-init script; the policy
   still pins every *external* origin — scripts, connections, frames, form
   targets — to an explicit allowlist. Revisit nonces if the site ever moves
   to dynamic rendering. */
const csp = [
  "default-src 'self'",
  // GA4 tag + Cloudflare Turnstile widget are the only foreign scripts.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  // Product imagery may come from the Shopify CDN once live data flows.
  "img-src 'self' data: blob: https://cdn.shopify.com",
  "font-src 'self'",
  // Storefront API (cart), GA4 collection, Turnstile verification.
  `connect-src 'self'${isDev ? " ws:" : ""} https://*.myshopify.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  // Checkout is a plain link navigation; forms never target foreign origins.
  "form-action 'self' https://*.myshopify.com",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  /* Allow LAN access to dev resources (HMR, JS chunks) when previewing on
     a phone via the LAN URL. Next 16 blocks cross-origin dev requests by
     default — without these origins, the page renders its static HTML but
     hydration JS never loads, so the splash stays visible forever. */
  allowedDevOrigins: ["192.168.10.77", "*.local"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
