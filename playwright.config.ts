import fs from "fs";
import { defineConfig, devices, chromium } from "@playwright/test";

const hasBundledChromium = (() => {
  try {
    return fs.existsSync(chromium.executablePath());
  } catch {
    return false;
  }
})();

/** Smoke tests run against an app that is already started (see .github/workflows/ci.yml). */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(hasBundledChromium ? {} : { channel: "msedge" }),
        launchOptions: {
          args: ["--disable-gpu", "--disable-dev-shm-usage"],
        },
      },
    },
  ],
});
