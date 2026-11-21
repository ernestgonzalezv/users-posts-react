import { defineConfig, devices } from '@playwright/test'

const onCi = process.env.CI !== undefined

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: onCi,
  retries: onCi ? 1 : 0,
  reporter: onCi ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobile/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !onCi,
    timeout: 120_000,
  },
})
