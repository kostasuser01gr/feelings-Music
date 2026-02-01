import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "NEXT_DISABLE_TURBOPACK=1 npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      NODE_OPTIONS: "--localstorage-file=/tmp/node-localstorage",
      NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "localhost",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "local-test",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "local-test",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "local-test",
      NEXT_PUBLIC_FIREBASE_APP_ID: "local-test",
    },
  },
});
