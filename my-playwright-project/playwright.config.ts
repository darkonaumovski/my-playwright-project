import { defineConfig, devices } from "@playwright/test";
import { environment } from "./config/environment";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: environment.isCI,
  retries: environment.isCI ? 2 : 0,
  workers: environment.isCI ? environment.ciWorkers : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: environment.isCI
    ? [["dot"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  metadata: {
    baseURL: environment.baseURL,
  },
  use: {
    baseURL: environment.baseURL,
    testIdAttribute: "data-test",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
