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
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
