import { defineConfig, devices } from "@playwright/test";

const adminPassword = process.env.ADMIN_PASSWORD ?? "test-password-16ch";
const cronSecret = process.env.CRON_SECRET ?? "cron-secret-16chars";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      ADMIN_PASSWORD: adminPassword,
      CRON_SECRET: cronSecret,
      UPWELL_ALLOW_LOOPBACK: "1",
    },
  },
});
