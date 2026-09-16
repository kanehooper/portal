import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/layout",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4317", browserName: "chromium", locale: "en-AU", timezoneId: "Australia/Melbourne", reducedMotion: "reduce", trace: "retain-on-failure" },
  expect: { toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.001 } },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 4317",
    url: "http://127.0.0.1:4317/layout-fixture",
    env: { LAYOUT_TEST_MODE: "1" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
