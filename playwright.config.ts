import { defineConfig } from "@playwright/test";

/* Smoke suite only — the handful of paths that cost money when broken.
   Runs against a production build: `npm run build` first (CI does this),
   then `npx playwright test` starts `next start` itself. */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    // Own port — never collides with (or reuses) the dev server on 3000,
    // which wouldn't have the smoke-test webhook secret.
    baseURL: "http://localhost:3005",
  },
  webServer: {
    command: "npm run start -- -p 3005",
    url: "http://localhost:3005",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Lets the webhook smoke tests sign payloads the server will accept.
    env: {
      SHOPIFY_WEBHOOK_SECRET: "smoke-test-webhook-secret",
      // Token signing fails closed in production builds without a secret.
      PASS_SIGNING_SECRET: "smoke-test-pass-secret",
    },
  },
});
