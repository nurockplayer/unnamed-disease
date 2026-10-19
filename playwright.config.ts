import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL=https://… pnpm e2e 可直接驗證已部署的版本（不啟動本機伺服器）
const remote = process.env.E2E_BASE_URL;
const baseURL = remote ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    // The game's reduced-motion mode keeps pulsing SVG hotspot bounds stable for clicks.
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium' },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], browserName: 'chromium' },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: 'pnpm build && pnpm preview --port 4173 --strictPort',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
